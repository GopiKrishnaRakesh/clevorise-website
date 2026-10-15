/**
 * KALLISTO OS - STOCK & INVENTORY ENGINE
 * Multi-channel stock sync, automated reordering, and barcode generator.
 */

window.KallistoStockEngine = {
  // Portion model (all optional; a SKU without these fields behaves as 1 portion = 1 unit):
  //   item.portionUnit      label for one portion, e.g. 'g' or 'slice'
  //   item.portionsPerUnit  portions in one whole stock unit, e.g. 1000 (g) per 1kg bag
  //   item.portionsUsed     portions already taken from the unit currently in use
  // item.stock counts whole units and a unit stays counted until it is fully used up.

  // Portions still available across all units, counting the partly used one
  remainingPortions(item) {
    const per = item.portionsPerUnit || 1;
    return item.stock > 0 ? item.stock * per - (item.portionsUsed || 0) : 0;
  },

  // Deduct whole inventory units (e.g. a whole bag written off)
  deductStock(skuId, qty = 1) {
    const state = window.KallistoOS.getState();
    const item = state.inventory.find(i => i.id === skuId);
    if (!item) return { success: false, reason: 'SKU not found' };
    return this.deductPortions(skuId, qty * (item.portionsPerUnit || 1));
  },

  // Deduct portions when an order line is processed (e.g. 18g of beans for one flat white).
  // Whole units come off the stock count only as they are used up.
  deductPortions(skuId, portions = 1) {
    const state = window.KallistoOS.getState();
    const item = state.inventory.find(i => i.id === skuId);
    if (!item) return { success: false, reason: 'SKU not found' };

    const per = item.portionsPerUnit || 1;
    const used = (item.portionsUsed || 0) + portions;
    const oldStock = item.stock;
    item.stock = Math.max(0, item.stock - Math.floor(used / per));
    item.portionsUsed = item.stock > 0 ? used % per : 0;
    window.KallistoOS.saveState(state);

    window.KallistoOS.bus.emit('stockUpdated', { skuId, oldStock, newStock: item.stock });

    // Autonomous Trigger: Low Stock Check
    if (item.stock <= item.minThreshold) {
      this.triggerAutoReorder(item);
    }

    return { success: true, item };
  },

  // Adjust stock level directly (manual reconciliation or delivery receipt)
  adjustStock(skuId, newQuantity, reason = 'Inventory audit') {
    const state = window.KallistoOS.getState();
    const item = state.inventory.find(i => i.id === skuId);
    if (!item) return false;

    const oldStock = item.stock;
    item.stock = parseInt(newQuantity, 10);
    if (item.stock <= 0) item.portionsUsed = 0;
    // Replenished above the reorder point: the open purchase order is fulfilled,
    // so a future dip below the threshold may raise a new one.
    if (item.openPO && item.stock > item.minThreshold) delete item.openPO;
    window.KallistoOS.saveState(state);

    window.KallistoOS.logAutomation(
      'STOCK_MANUAL_ADJUSTMENT',
      `${item.name} (${skuId}) updated from ${oldStock} to ${item.stock} (${reason}).`
    );
    window.KallistoOS.bus.emit('stockUpdated', { skuId, oldStock, newStock: item.stock });
    return true;
  },

  // Autonomous reorder: Generate supplier PO draft without human manual intervention
  // Raises at most ONE open PO per SKU: the PO is recorded on the item (item.openPO) and
  // stays open until stock is replenished above minThreshold (see adjustStock).
  // Returns true if a new PO was raised, false if one is already open.
  triggerAutoReorder(item) {
    const state = window.KallistoOS.getState();
    const stored = state.inventory.find(i => i.id === item.id);
    if (!stored || stored.openPO) return false;

    const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const totalCost = parseFloat((item.costPrice * item.autoReorderQty).toFixed(2));

    stored.openPO = { poNumber, date: new Date().toISOString().split('T')[0] };
    window.KallistoOS.saveState(state);

    window.KallistoOS.logAutomation(
      'AUTONOMOUS_PURCHASE_ORDER',
      `Low stock alert for ${item.name} (${item.stock} left <= threshold ${item.minThreshold}). Autonomous PO ${poNumber} dispatched to ${item.supplier} for ${item.autoReorderQty} units (£${totalCost.toFixed(2)}).`
    );

    window.KallistoOS.bus.emit('purchaseOrderGenerated', {
      poNumber,
      sku: item.id,
      name: item.name,
      supplier: item.supplier,
      supplierEmail: item.supplierEmail,
      qty: item.autoReorderQty,
      costPrice: item.costPrice,
      totalCost,
      date: new Date().toISOString().split('T')[0]
    });
    return true;
  },

  // Render minimal SVG barcode for SKU labeling
  generateBarcodeSvg(barcodeText) {
    // Generate simple readable pseudo-Code128 barcode pattern
    let bars = '';
    let x = 10;
    for (let i = 0; i < barcodeText.length; i++) {
      const charCode = barcodeText.charCodeAt(i);
      const width1 = (charCode % 3) + 1;
      const width2 = ((charCode * 2) % 3) + 1;
      bars += `<rect x="${x}" y="5" width="${width1}" height="38" fill="#0f172a" />`;
      x += width1 + 2;
      bars += `<rect x="${x}" y="5" width="${width2}" height="38" fill="#0f172a" />`;
      x += width2 + 2;
    }

    return `
      <svg width="${x + 10}" height="56" viewBox="0 0 ${x + 10} 56" xmlns="http://www.w3.org/2000/svg">
        ${bars}
        <text x="${(x + 10) / 2}" y="52" font-family="monospace" font-size="10" text-anchor="middle" fill="#475569">${barcodeText}</text>
      </svg>
    `;
  }
};
