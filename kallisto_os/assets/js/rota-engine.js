/**
 * KALLISTO OS - STAFF ROTA & LABOUR EFFICIENCY ENGINE
 * UK National Living Wage compliance & real-time labour cost ratio tracker.
 */

window.KallistoRotaEngine = {
  // UK Statutory National Living Wage (April 2024 / 2025/2026 standard for 21+)
  MINIMUM_NLW_RATE: 11.44,

  // Calculate total weekly labour expenditure
  calculateWeeklyLabour(staffList) {
    let totalWeeklyHours = 0;
    let totalWeeklyCost = 0;

    staffList.forEach(member => {
      // Validate statutory NLW compliance
      const compliantRate = Math.max(this.MINIMUM_NLW_RATE, member.rate);
      const memberCost = compliantRate * member.weeklyHours;
      totalWeeklyHours += member.weeklyHours;
      totalWeeklyCost += memberCost;
    });

    return {
      totalHours: totalWeeklyHours,
      totalCost: parseFloat(totalWeeklyCost.toFixed(2)),
      averageHourlyWage: totalWeeklyHours > 0 ? parseFloat((totalWeeklyCost / totalWeeklyHours).toFixed(2)) : 0
    };
  },

  // Calculate labour cost percentage against projected or live sales revenue
  calculateLabourEfficiency(weeklyLabourCost, projectedWeeklyRevenue) {
    if (!projectedWeeklyRevenue || projectedWeeklyRevenue <= 0) {
      return { ratio: 0, status: 'unknown', message: 'No revenue projected' };
    }

    const ratioPercent = parseFloat(((weeklyLabourCost / projectedWeeklyRevenue) * 100).toFixed(1));

    let status = 'optimal';
    let message = 'Labour within prime efficiency corridor (20% - 28%)';

    if (ratioPercent > 32.0) {
      status = 'danger';
      message = 'Critical labour overrun (>32%). Margins severely compressed.';
    } else if (ratioPercent > 28.0) {
      status = 'warning';
      message = 'Slight labour overrun (28% - 32%). Monitor off-peak staffing.';
    } else if (ratioPercent < 18.0) {
      status = 'lean';
      message = 'Very lean labour (<18%). Ensure service quality and wait times are maintained.';
    }

    return {
      ratioPercent,
      status,
      message,
      targetBand: '22% - 28%'
    };
  },

  // Clock in / Clock out toggle for virtual attendance logger
  toggleClockIn(staffId) {
    const state = window.KallistoOS.getState();
    const staff = state.staff.find(s => s.id === staffId);
    if (!staff) return false;

    const newStatus = staff.status === 'clocked-in' ? 'scheduled' : 'clocked-in';
    staff.status = newStatus;
    window.KallistoOS.saveState(state);

    window.KallistoOS.logAutomation(
      'STAFF_ATTENDANCE',
      `${staff.name} (${staff.role}) marked as ${newStatus.toUpperCase()} at ${new Date().toLocaleTimeString('en-GB')}.`
    );

    window.KallistoOS.bus.emit('staffStatusChanged', { staffId, newStatus });
    return newStatus;
  },

  // Add new staff member with UK NLW check
  addStaffMember(staffData) {
    const state = window.KallistoOS.getState();
    const rate = parseFloat(staffData.rate);

    if (rate < this.MINIMUM_NLW_RATE) {
      alert(`UK Compliance Error: The rate of £${rate.toFixed(2)}/hr is below the UK National Living Wage (£${this.MINIMUM_NLW_RATE.toFixed(2)}/hr). Rate automatically adjusted to statutory minimum.`);
      staffData.rate = this.MINIMUM_NLW_RATE;
    }

    const newStaff = {
      id: `STF-${Math.floor(10 + Math.random() * 90)}`,
      status: 'scheduled',
      shifts: [],
      ...staffData
    };

    state.staff.push(newStaff);
    window.KallistoOS.saveState(state);
    window.KallistoOS.logAutomation('STAFF_ADDED', `New team member ${newStaff.name} added (${newStaff.role} @ £${newStaff.rate}/hr).`);
    window.KallistoOS.bus.emit('staffUpdated', state.staff);
    return newStaff;
  }
};
