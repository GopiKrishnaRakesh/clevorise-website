/* Solution page: "Simulate Transaction Burst" demo (moved out of the HTML so the site can run a strict CSP) */
document.addEventListener('DOMContentLoaded', () => {
  const pulseBtn = document.getElementById('flow-pulse-btn');
  const pulseText = document.getElementById('pulse-btn-text');
  const tickDisplay = document.getElementById('pipeline-tick');
  const pulseDots = document.querySelectorAll('.pulse-dot');
  if (!pulseBtn || !pulseText || !tickDisplay) return;

  pulseBtn.addEventListener('click', () => {
    pulseText.textContent = 'Simulating High Traffic Burst...';
    pulseDots.forEach((dot) => { dot.style.transform = 'scale(2)'; });
    tickDisplay.textContent = '0.008s (Sub-10ms burst)';
    tickDisplay.style.color = '#0066ff';

    setTimeout(() => {
      pulseText.textContent = 'Simulate Transaction Burst';
      pulseDots.forEach((dot) => { dot.style.transform = ''; });
      tickDisplay.textContent = '0.024s';
      tickDisplay.style.color = '#111827';
    }, 1800);
  });
});
