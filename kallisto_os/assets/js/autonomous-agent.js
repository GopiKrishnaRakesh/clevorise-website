/**
 * KALLISTO OS - AUTONOMOUS AGENT ENGINE ("ZERO HUMAN INTERFERENCE")
 * Event-driven autonomous watchdog that automates business operations in the background.
 */

window.KallistoAutonomousAgent = {
  active: true,
  checkIntervalMs: 8000,
  intervalHandle: null,

  init() {
    this.startWatchdog();
    this.bindBusEvents();
  },

  startWatchdog() {
    if (this.intervalHandle) clearInterval(this.intervalHandle);
    this.intervalHandle = setInterval(() => {
      if (this.active) {
        this.runAutonomousAuditCycle();
      }
    }, this.checkIntervalMs);
  },

  bindBusEvents() {
    // When an order is placed from kiosk, automatically check stock
    window.KallistoOS.bus.on('orderCreated', (order) => {
      this.runStockAudit();
    });

    // When an order is dispatched, auto-reconcile revenue
    window.KallistoOS.bus.on('orderUpdated', (order) => {
      if (order.status === 'dispatched') {
        window.KallistoOS.logAutomation(
          'AUTONOMOUS_SETTLEMENT',
          `Order ${order.id} closed. £${order.total.toFixed(2)} synchronized to UK MTD daily ledger.`
        );
      }
    });
  },

  // Periodic autonomous health cycle
  runAutonomousAuditCycle() {
    this.runStockAudit();
    this.runOverdueInvoiceAudit();
    this.runLabourGuardAudit();
  },

  // 1. Autonomous Stock Audit
  runStockAudit() {
    const state = window.KallistoOS.getState();
    state.inventory.forEach(item => {
      if (item.stock <= item.minThreshold) {
        // triggerAutoReorder ignores SKUs that already have an open PO
        window.KallistoStockEngine.triggerAutoReorder(item);
      }
    });
  },

  // 2. Autonomous Overdue Invoice Audit (UK Late Payment Act)
  runOverdueInvoiceAudit() {
    const state = window.KallistoOS.getState();
    const now = new Date();
    state.invoices.forEach(inv => {
      if (inv.status === 'sent' && new Date(inv.dueDate) < now) {
        inv.status = 'overdue';
        const feeData = window.KallistoInvoiceEngine.calculateLatePaymentFees(inv.total, inv.dueDate);
        window.KallistoOS.saveState(state);
        window.KallistoOS.logAutomation(
          'STATUTORY_LATE_NOTICE_DRAFTED',
          `Invoice ${inv.id} (${inv.clientName}) is ${feeData.daysOverdue} days overdue. Autonomous statutory late notice prepared: £${feeData.compensationFee} fee + £${feeData.interestAccrued} interest (${feeData.annualRatePercent}% p.a.).`
        );
      }
    });
  },

  // 3. Autonomous Labour Efficiency Guard
  runLabourGuardAudit() {
    const state = window.KallistoOS.getState();
    const weeklyLabour = window.KallistoRotaEngine.calculateWeeklyLabour(state.staff);
    const projectedWeeklyRevenue = state.financials.monthlyTarget / 4.33;
    const efficiency = window.KallistoRotaEngine.calculateLabourEfficiency(weeklyLabour.totalCost, projectedWeeklyRevenue);

    if (efficiency.status === 'danger') {
      window.KallistoOS.logAutomation(
        'LABOUR_OVERRUN_GUARD',
        `Warning: Current rota labour cost is ${efficiency.ratioPercent}% of revenue (Threshold: 28%). Rebalance recommendation active.`
      );
    }
  },

  // Demonstration helper: Simulates a customer placing a walk-in / online order
  simulateIncomingOrder() {
    const state = window.KallistoOS.getState();
    if (state.menu.length === 0) return;

    const randomItem = state.menu[Math.floor(Math.random() * state.menu.length)];
    const tables = ['Table 2', 'Table 5', 'Takeaway #42', 'Table 9', 'Bar Seat 3'];
    const names = ['Emma Watson', 'James Sinclair', 'Amina Begum', 'Harry Croft', 'Chloe Green'];

    window.KallistoOrderEngine.clearCart();
    window.KallistoOrderEngine.addToCart(randomItem, [], 'Special autonomous simulation');
    const result = window.KallistoOrderEngine.submitOrder(
      tables[Math.floor(Math.random() * tables.length)],
      names[Math.floor(Math.random() * names.length)]
    );

    return result;
  }
};

// Start the autonomous watchdog automatically on load
window.KallistoAutonomousAgent.init();
