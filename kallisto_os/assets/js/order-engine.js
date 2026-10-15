/**
 * KALLISTO OS - SELF-ORDERING & KITCHEN DISPATCH ENGINE
 * Bridges customer self-order kiosks with live kitchen/fulfillment queues.
 */

window.KallistoOrderEngine = {
  cart: [],

  // Add item to active ordering cart
  addToCart(menuItem, selectedModifiers = [], specialNotes = '') {
    const existingIndex = this.cart.findIndex(i =>
      i.id === menuItem.id &&
      JSON.stringify(i.modifiers) === JSON.stringify(selectedModifiers) &&
      i.notes === specialNotes
    );

    let modifierTotal = 0;
    selectedModifiers.forEach(m => modifierTotal += (m.price || 0));

    if (existingIndex > -1) {
      this.cart[existingIndex].qty += 1;
    } else {
      this.cart.push({
        id: menuItem.id,
        name: menuItem.name,
        basePrice: menuItem.price,
        unitPrice: menuItem.price + modifierTotal,
        qty: 1,
        linkedSku: menuItem.linkedSku,
        portionsPerSale: menuItem.portionsPerSale || 1, // portions of the linked SKU used per item sold
        modifiers: selectedModifiers,
        notes: specialNotes
      });
    }

    window.KallistoOS.bus.emit('cartUpdated', this.cart);
    return this.cart;
  },

  // Adjust item quantity in cart
  updateCartQty(index, qty) {
    if (this.cart[index]) {
      if (qty <= 0) {
        this.cart.splice(index, 1);
      } else {
        this.cart[index].qty = qty;
      }
      window.KallistoOS.bus.emit('cartUpdated', this.cart);
    }
  },

  // Clear current cart
  clearCart() {
    this.cart = [];
    window.KallistoOS.bus.emit('cartUpdated', this.cart);
  },

  // Get current cart calculations
  getCartSummary() {
    let subtotal = 0;
    this.cart.forEach(item => {
      subtotal += item.unitPrice * item.qty;
    });
    const total = subtotal; // Inclusive pricing standard in UK hospitality/retail
    const vat = total - total / 1.20; // VAT contained in a VAT-inclusive price (1/6 of the total)

    return {
      itemCount: this.cart.reduce((acc, item) => acc + item.qty, 0),
      subtotal: parseFloat(subtotal.toFixed(2)),
      vatAmount: parseFloat(vat.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    };
  },

  // Dispatch submitted self-order into live queue
  submitOrder(tableOrLocation = 'Counter / Takeaway', customerName = 'Guest') {
    if (this.cart.length === 0) return { success: false, error: 'Cart is empty' };

    const summary = this.getCartSummary();
    const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      id: orderNumber,
      table: tableOrLocation,
      customer: customerName,
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      status: 'pending', // pending -> preparing -> ready -> dispatched
      items: this.cart.map(item => ({
        name: item.name,
        qty: item.qty,
        price: item.unitPrice,
        notes: item.notes || (item.modifiers.length ? item.modifiers.map(m => m.name).join(', ') : '')
      })),
      total: summary.total
    };

    // 1. Autonomous Stock Deduction
    this.cart.forEach(item => {
      if (item.linkedSku && window.KallistoStockEngine) {
        window.KallistoStockEngine.deductPortions(item.linkedSku, item.qty * (item.portionsPerSale || 1));
      }
    });

    // 2. Add to live queue (read state AFTER deductions: getState() returns a fresh copy,
    //    so a copy taken earlier would overwrite the stock changes on save)
    const state = window.KallistoOS.getState();
    state.orders.unshift(newOrder);
    window.KallistoOS.saveState(state);

    // 3. Autonomous Automation Log
    window.KallistoOS.logAutomation(
      'ORDER_SUBMITTED',
      `Self-Order ${orderNumber} placed for ${tableOrLocation} (£${summary.total.toFixed(2)}). Stock deducted automatically.`
    );

    // 4. Clear cart & emit
    this.clearCart();
    window.KallistoOS.bus.emit('orderCreated', newOrder);

    return { success: true, order: newOrder };
  },

  // Transition order status in Kitchen Display System (KDS)
  advanceOrderStatus(orderId) {
    const state = window.KallistoOS.getState();
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return false;

    const pipeline = ['pending', 'preparing', 'ready', 'dispatched'];
    const currentIndex = pipeline.indexOf(order.status);

    if (currentIndex < pipeline.length - 1) {
      const nextStatus = pipeline[currentIndex + 1];
      order.status = nextStatus;
      window.KallistoOS.saveState(state);

      window.KallistoOS.logAutomation(
        'ORDER_STATUS_CHANGED',
        `Order ${orderId} progressed to '${nextStatus.toUpperCase()}'.`
      );

      // If dispatched, automatically sync to revenue ledger & invoice
      if (nextStatus === 'dispatched') {
        window.KallistoOS.logAutomation(
          'AUTONOMOUS_REVENUE_LOG',
          `Order ${orderId} finalized. £${order.total.toFixed(2)} synchronized to daily gross sales.`
        );
      }

      window.KallistoOS.bus.emit('orderUpdated', order);
      return nextStatus;
    }
    return false;
  }
};
