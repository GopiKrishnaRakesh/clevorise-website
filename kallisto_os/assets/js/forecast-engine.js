/**
 * KALLISTO OS - FINANCIAL FORECAST & P&L ENGINE
 * Real-time gross/net profit & loss, break-even analysis, and 30/60/90-day forecasting.
 */

window.KallistoForecastEngine = {
  // Generate real-time waterfall P&L from store state
  generateCurrentPnl() {
    const state = window.KallistoOS.getState();
    const client = window.KallistoClients ? window.KallistoClients.getCurrentClient() : { currency: '£' };

    // 1. Calculate Revenue from Invoices & Dispatched Orders
    let invoicedRevenue = 0;
    state.invoices.forEach(inv => {
      if (inv.status === 'paid' || inv.status === 'sent') {
        invoicedRevenue += inv.subtotal; // Excluding VAT for P&L net sales
      }
    });

    let liveOrderRevenue = 0;
    state.orders.forEach(ord => {
      liveOrderRevenue += ord.total / 1.20; // Strip 20% VAT to get net sales
    });

    const monthlyGrossSales = Math.max(state.financials.monthlyTarget * 0.85, invoicedRevenue + liveOrderRevenue * 30);
    const discounts = monthlyGrossSales * 0.02; // 2% average promotional discounts
    const netSales = monthlyGrossSales - discounts;

    // 2. Cost of Goods Sold (COGS)
    const cogsAmount = netSales * (state.financials.cogsRate || 0.28);
    const grossProfit = netSales - cogsAmount;
    const grossMarginPercent = (grossProfit / netSales) * 100;

    // 3. Operating Expenses (Opex)
    const monthlyLabourCost = (state.staff.reduce((acc, s) => acc + (s.rate * s.weeklyHours), 0)) * 4.33;
    const rent = state.financials.fixedRent || 3200.00;
    const utilities = state.financials.fixedUtilities || 750.00;
    const software = state.financials.softwareSubscriptions || 180.00;
    const marketing = state.financials.marketingSpend || 650.00;

    const totalOpex = monthlyLabourCost + rent + utilities + software + marketing;

    // 4. Net Profit / (Loss)
    const netProfit = grossProfit - totalOpex;
    const netMarginPercent = (netProfit / netSales) * 100;

    // 5. Break-Even Sales Calculus
    const totalFixedCosts = rent + utilities + software + marketing + (monthlyLabourCost * 0.6); // 60% fixed staff
    const contributionMarginRatio = 1 - (state.financials.cogsRate || 0.28);
    const breakEvenMonthlySales = contributionMarginRatio > 0 ? (totalFixedCosts / contributionMarginRatio) : 0;
    const dailyBreakEvenSales = breakEvenMonthlySales / 30;

    return {
      currency: client.currency || '£',
      monthlyGrossSales: parseFloat(monthlyGrossSales.toFixed(2)),
      discounts: parseFloat(discounts.toFixed(2)),
      netSales: parseFloat(netSales.toFixed(2)),
      cogsAmount: parseFloat(cogsAmount.toFixed(2)),
      grossProfit: parseFloat(grossProfit.toFixed(2)),
      grossMarginPercent: parseFloat(grossMarginPercent.toFixed(1)),
      opex: {
        labour: parseFloat(monthlyLabourCost.toFixed(2)),
        rent: parseFloat(rent.toFixed(2)),
        utilities: parseFloat(utilities.toFixed(2)),
        software: parseFloat(software.toFixed(2)),
        marketing: parseFloat(marketing.toFixed(2)),
        total: parseFloat(totalOpex.toFixed(2))
      },
      netProfit: parseFloat(netProfit.toFixed(2)),
      netMarginPercent: parseFloat(netMarginPercent.toFixed(1)),
      isProfitable: netProfit >= 0,
      breakEven: {
        monthly: parseFloat(breakEvenMonthlySales.toFixed(2)),
        daily: parseFloat(dailyBreakEvenSales.toFixed(2)),
        bufferRatio: parseFloat(((netSales / breakEvenMonthlySales) - 1) * 100).toFixed(1)
      }
    };
  },

  // Generate 30, 60, and 90-day forward projections with 3 scenarios
  generateMultiHorizonForecast(growthRateMonthly = 0.04) {
    const current = this.generateCurrentPnl();
    const baseSales = current.netSales;

    const horizons = [
      { days: 30, months: 1 },
      { days: 60, months: 2 },
      { days: 90, months: 3 }
    ];

    return horizons.map(h => {
      const expectedSales = baseSales * Math.pow(1 + growthRateMonthly, h.months);
      const bullishSales = baseSales * Math.pow(1 + growthRateMonthly + 0.05, h.months);
      const pessimisticSales = baseSales * Math.pow(1 + growthRateMonthly - 0.06, h.months);

      const expectedNet = (expectedSales * (1 - 0.28)) - current.opex.total;
      const bullishNet = (bullishSales * (1 - 0.28)) - (current.opex.total * 1.04);
      const pessimisticNet = (pessimisticSales * (1 - 0.28)) - current.opex.total;

      return {
        horizonDays: h.days,
        expected: {
          sales: parseFloat(expectedSales.toFixed(2)),
          netProfit: parseFloat(expectedNet.toFixed(2))
        },
        bullish: {
          sales: parseFloat(bullishSales.toFixed(2)),
          netProfit: parseFloat(bullishNet.toFixed(2))
        },
        pessimistic: {
          sales: parseFloat(pessimisticSales.toFixed(2)),
          netProfit: parseFloat(pessimisticNet.toFixed(2))
        }
      };
    });
  }
};
