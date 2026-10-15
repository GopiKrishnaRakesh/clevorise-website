/**
 * KALLISTO OS - INVOICE & UK TAX (HMRC MTD) ENGINE
 * Compliant with UK VAT (20%, 5%, 0%) & Statutory Late Payment Interest Act 1998
 */

window.KallistoInvoiceEngine = {
  BOE_BASE_RATE: 0.0525, // 5.25% current Bank of England base rate
  STATUTORY_INTEREST_ADDON: 0.08, // 8% statutory late interest under UK law

  // Calculate UK statutory compensation and interest for overdue commercial debts
  calculateLatePaymentFees(principal, dueDateString) {
    const due = new Date(dueDateString);
    const now = new Date();
    const diffTime = Math.max(0, now - due);
    const daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (daysOverdue <= 0) {
      return { daysOverdue: 0, compensationFee: 0, dailyInterestRate: 0, interestAccrued: 0, totalDue: principal };
    }

    // Fixed compensation under Late Payment Act:
    let compensationFee = 40.00;
    if (principal >= 10000.00) compensationFee = 100.00;
    else if (principal >= 1000.00) compensationFee = 70.00;

    // 8% + Bank of England base rate
    const annualRate = this.STATUTORY_INTEREST_ADDON + this.BOE_BASE_RATE; // e.g. 13.25%
    const dailyRate = annualRate / 365;
    const interestAccrued = parseFloat((principal * dailyRate * daysOverdue).toFixed(2));
    const totalDue = parseFloat((principal + compensationFee + interestAccrued).toFixed(2));

    return {
      daysOverdue,
      compensationFee,
      annualRatePercent: (annualRate * 100).toFixed(2),
      interestAccrued,
      totalDue
    };
  },

  // Calculate line items, VAT, and invoice totals
  calculateInvoiceTotals(items, vatRate = 0.20, discountPercent = 0) {
    let subtotal = 0;
    items.forEach(item => {
      const lineTotal = parseFloat((item.qty * item.unitPrice).toFixed(2));
      item.amount = lineTotal;
      subtotal += lineTotal;
    });

    const discountAmount = parseFloat((subtotal * (discountPercent / 100)).toFixed(2));
    const discountedSubtotal = subtotal - discountAmount;
    const vatAmount = parseFloat((discountedSubtotal * vatRate).toFixed(2));
    const total = parseFloat((discountedSubtotal + vatAmount).toFixed(2));

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      discountAmount,
      discountedSubtotal,
      vatRate,
      vatRateLabel: `${Math.round(vatRate * 100)}%`,
      vatAmount,
      total
    };
  },

  // Create and save invoice in global store
  createInvoice(invoiceData) {
    const state = window.KallistoOS.getState();
    const newId = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullInvoice = {
      id: newId,
      date: new Date().toISOString().split('T')[0],
      status: 'sent',
      ...invoiceData
    };

    state.invoices.unshift(fullInvoice);
    window.KallistoOS.saveState(state);
    window.KallistoOS.logAutomation(
      'INVOICE_GENERATED',
      `Invoice ${newId} issued for ${fullInvoice.clientName} (£${fullInvoice.total.toFixed(2)} inc. VAT).`
    );
    window.KallistoOS.bus.emit('invoiceCreated', fullInvoice);
    return fullInvoice;
  },

  // Update invoice status (e.g. mark as paid)
  updateStatus(invoiceId, newStatus) {
    const state = window.KallistoOS.getState();
    const inv = state.invoices.find(i => i.id === invoiceId);
    if (inv) {
      inv.status = newStatus;
      window.KallistoOS.saveState(state);
      window.KallistoOS.logAutomation(
        'INVOICE_STATUS_UPDATED',
        `Invoice ${invoiceId} updated to status '${newStatus.toUpperCase()}'.`
      );
      window.KallistoOS.bus.emit('invoiceStatusChanged', { invoiceId, newStatus });
      return true;
    }
    return false;
  }
};
