/**
 * CLEVORISE OS - Mock Payment Terminal & Webhook Simulator
 * Supports: Stripe Terminal UK, Square Reader, SumUp Air, Contactless NFC, Chip & PIN, Faster Payments QR
 */

(function(window) {
  'use strict';

  const PaymentTerminal = {
    currentTransaction: null,
    provider: 'stripe', // 'stripe' | 'square' | 'sumup'
    pinBuffer: '',

    init() {
      this.injectStyles();
      this.injectModal();
    },

    injectStyles() {
      if (document.getElementById('terminal-styles')) return;
      const style = document.createElement('style');
      style.id = 'terminal-styles';
      style.textContent = `
        .terminal-modal-overlay {
          position: fixed; inset: 0; z-index: 10000;
          background: rgba(10, 15, 29, 0.82);
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          display: none; align-items: center; justify-content: center;
          padding: 1rem; animation: termFadeIn 0.25s ease-out forwards;
        }
        .terminal-modal-overlay.active { display: flex; }
        @keyframes termFadeIn { from { opacity: 0; } to { opacity: 1; } }

        .terminal-device-chassis {
          background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 24px; width: 100%; max-width: 440px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255,255,255,0.2);
          overflow: hidden; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .terminal-topbar {
          background: #1e293b; padding: 0.85rem 1.25rem;
          display: flex; justify-content: space-between; align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .terminal-led-row { display: flex; gap: 6px; }
        .terminal-led {
          width: 8px; height: 8px; border-radius: 50%; background: #334155;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .terminal-led.green { background: #10b981; box-shadow: 0 0 10px #10b981; }
        .terminal-led.amber { background: #f59e0b; box-shadow: 0 0 10px #f59e0b; }
        .terminal-led.blue { background: #0ea5e9; box-shadow: 0 0 10px #0ea5e9; }

        .terminal-body { padding: 1.5rem; display: flex; flex-direction: column; align-items: center; text-align: center; }

        .terminal-amount-banner {
          background: rgba(14, 165, 233, 0.08); border: 1px solid rgba(14, 165, 233, 0.25);
          border-radius: 14px; padding: 1rem 1.5rem; width: 100%; margin-bottom: 1.25rem;
        }
        .terminal-amount-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; }
        .terminal-amount-val { font-size: 2rem; font-weight: 700; color: #f8fafc; margin-top: 0.25rem; }

        .terminal-provider-tabs {
          display: flex; gap: 6px; background: #1e293b; padding: 4px; border-radius: 10px;
          margin-bottom: 1.25rem; width: 100%;
        }
        .terminal-tab-btn {
          flex: 1; padding: 0.4rem 0.6rem; font-size: 0.75rem; font-weight: 600;
          color: #94a3b8; border: none; background: transparent; border-radius: 7px;
          cursor: pointer; transition: all 0.2s ease;
        }
        .terminal-tab-btn.active { background: #0f172a; color: #f8fafc; box-shadow: 0 2px 4px rgba(0,0,0,0.3); }

        .terminal-tap-target {
          position: relative; width: 160px; height: 160px; border-radius: 50%;
          background: radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, rgba(15, 23, 42, 0) 70%);
          border: 2px dashed rgba(14, 165, 233, 0.4); display: flex; flex-direction: column;
          align-items: center; justify-content: center; cursor: pointer; margin: 0.5rem 0 1.25rem;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .terminal-tap-target:hover { transform: scale(1.04); border-color: #0ea5e9; }
        .terminal-tap-target:active { transform: scale(0.97); }

        .tap-pulse-ring {
          position: absolute; inset: -10px; border-radius: 50%; border: 1.5px solid #0ea5e9;
          opacity: 0; animation: tapPulse 2s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
        }
        @keyframes tapPulse {
          0% { transform: scale(0.85); opacity: 0.8; }
          100% { transform: scale(1.25); opacity: 0; }
        }

        .terminal-keypad {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; width: 100%;
          margin-top: 1rem;
        }
        .term-key {
          padding: 0.75rem; background: #1e293b; border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px; color: #f8fafc; font-size: 1.1rem; font-weight: 600;
          cursor: pointer; transition: background 0.15s;
        }
        .term-key:hover { background: #334155; }
        .term-key.action-enter { background: #10b981; color: #022c22; font-weight: 700; }
        .term-key.action-enter:hover { background: #059669; }
        .term-key.action-clear { background: #e11d48; color: #fff; }

        .terminal-status-text {
          font-size: 0.85rem; color: #94a3b8; margin-top: 0.5rem; min-height: 1.25rem;
        }

        /* Digital Receipt Modal */
        .receipt-card {
          background: #ffffff; color: #0f172a; border-radius: 16px;
          width: 100%; max-width: 380px; padding: 1.75rem; box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
          border-top: 6px solid #0ea5e9; animation: termFadeIn 0.3s ease;
        }
      `;
      document.head.appendChild(style);
    },

    injectModal() {
      if (document.getElementById('terminal-modal')) return;
      const modal = document.createElement('div');
      modal.id = 'terminal-modal';
      modal.className = 'terminal-modal-overlay';
      modal.innerHTML = `
        <div class="terminal-device-chassis" id="terminal-chassis">
          <div class="terminal-topbar">
            <div style="display:flex; align-items:center; gap:8px;">
              <span id="term-brand-label" style="font-weight:700; font-size:0.85rem; letter-spacing:0.02em;">STRIPE TERMINAL UK</span>
              <span style="font-size:0.65rem; background:#334155; padding:2px 6px; border-radius:6px; color:#cbd5e1;">TEST MODE</span>
            </div>
            <div class="terminal-led-row">
              <div class="terminal-led green" id="led-1"></div>
              <div class="terminal-led green" id="led-2"></div>
              <div class="terminal-led green" id="led-3"></div>
              <div class="terminal-led green" id="led-4"></div>
            </div>
          </div>

          <div class="terminal-body" id="terminal-screen-main">
            <div class="terminal-amount-banner">
              <div class="terminal-amount-label">Amount Due</div>
              <div class="terminal-amount-val" id="term-amount-display">£0.00</div>
              <div style="font-size:0.75rem; color:#38bdf8; margin-top:4px;" id="term-order-ref">Order #ORD-101</div>
            </div>

            <div class="terminal-provider-tabs">
              <button class="terminal-tab-btn active" data-provider="stripe" onclick="PaymentTerminal.setProvider('stripe')">Stripe UK</button>
              <button class="terminal-tab-btn" data-provider="square" onclick="PaymentTerminal.setProvider('square')">Square Reader</button>
              <button class="terminal-tab-btn" data-provider="sumup" onclick="PaymentTerminal.setProvider('sumup')">SumUp Air</button>
            </div>

            <!-- Contactless NFC Tap Simulator -->
            <div class="terminal-tap-target" id="terminal-tap-zone" onclick="PaymentTerminal.simulateNfcTap()">
              <div class="tap-pulse-ring"></div>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
                <path d="M12 2v2"/>
              </svg>
              <div style="font-weight:700; font-size:0.85rem; margin-top:0.5rem; color:#f8fafc;">TAP CARD / PHONE</div>
              <div style="font-size:0.68rem; color:#94a3b8;">Apple Pay / Google Pay / Visa</div>
            </div>

            <div class="terminal-status-text" id="term-status-msg">Present contactless card or insert chip</div>

            <!-- Keypad Accordion / Toggle -->
            <button class="btn btn-outline" style="width:100%; font-size:0.75rem; padding:0.4rem; margin-top:0.75rem;" onclick="PaymentTerminal.toggleKeypad()">
              ⌨️ Toggle Chip & PIN Keypad
            </button>

            <div class="terminal-keypad" id="terminal-keypad" style="display:none;">
              <button class="term-key" onclick="PaymentTerminal.keyPress('1')">1</button>
              <button class="term-key" onclick="PaymentTerminal.keyPress('2')">2</button>
              <button class="term-key" onclick="PaymentTerminal.keyPress('3')">3</button>
              <button class="term-key" onclick="PaymentTerminal.keyPress('4')">4</button>
              <button class="term-key" onclick="PaymentTerminal.keyPress('5')">5</button>
              <button class="term-key" onclick="PaymentTerminal.keyPress('6')">6</button>
              <button class="term-key" onclick="PaymentTerminal.keyPress('7')">7</button>
              <button class="term-key" onclick="PaymentTerminal.keyPress('8')">8</button>
              <button class="term-key" onclick="PaymentTerminal.keyPress('9')">9</button>
              <button class="term-key action-clear" onclick="PaymentTerminal.keyPress('clear')">Cancel</button>
              <button class="term-key" onclick="PaymentTerminal.keyPress('0')">0</button>
              <button class="term-key action-enter" onclick="PaymentTerminal.keyPress('enter')">Enter</button>
            </div>

            <div style="display:flex; justify-content:space-between; width:100%; margin-top:1.25rem;">
              <button class="btn btn-outline" onclick="PaymentTerminal.closeModal()" style="font-size:0.8rem; padding:0.5rem 1rem;">Cancel</button>
              <button class="btn btn-primary" onclick="PaymentTerminal.simulateNfcTap()" style="font-size:0.8rem; padding:0.5rem 1rem;">Simulate Quick Tap ⚡</button>
            </div>
          </div>

          <!-- Digital Receipt Screen -->
          <div class="terminal-body" id="terminal-screen-receipt" style="display:none; background:#f1f5f9; padding:1.5rem;">
            <div class="receipt-card" id="receipt-card-content">
              <div style="text-align:center; border-bottom:1px dashed #cbd5e1; padding-bottom:0.75rem; margin-bottom:0.75rem;">
                <div style="font-size:1.25rem; font-weight:800; color:#0f172a;" id="receipt-biz-name">CLEVORISE UK</div>
                <div style="font-size:0.75rem; color:#64748b;" id="receipt-biz-addr">London, United Kingdom</div>
                <div style="font-size:0.7rem; color:#64748b;">VAT Reg: GB 928 4810 52</div>
              </div>

              <div style="font-size:0.78rem; display:flex; justify-content:space-between; margin-bottom:0.35rem;">
                <span style="color:#64748b;">Date & Time:</span>
                <span id="receipt-timestamp" style="font-weight:600;"></span>
              </div>
              <div style="font-size:0.78rem; display:flex; justify-content:space-between; margin-bottom:0.35rem;">
                <span style="color:#64748b;">Txn ID:</span>
                <span id="receipt-txnid" style="font-weight:600;"></span>
              </div>
              <div style="font-size:0.78rem; display:flex; justify-content:space-between; margin-bottom:0.75rem;">
                <span style="color:#64748b;">Auth Code:</span>
                <span id="receipt-authcode" style="font-weight:600; color:#10b981;">AUTH_82910</span>
              </div>

              <div id="receipt-items-list" style="border-top:1px dashed #cbd5e1; border-bottom:1px dashed #cbd5e1; padding:0.5rem 0; margin-bottom:0.75rem; font-size:0.8rem;">
                <!-- Line items inserted dynamically -->
              </div>

              <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.25rem;">
                <span>Net Subtotal:</span>
                <span id="receipt-net">£0.00</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.4rem; color:#64748b;">
                <span>VAT (20% UK Standard):</span>
                <span id="receipt-vat">£0.00</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:1.15rem; font-weight:800; border-top:1px solid #0f172a; padding-top:0.4rem; margin-bottom:1rem;">
                <span>TOTAL PAID:</span>
                <span id="receipt-total">£0.00</span>
              </div>

              <div style="text-align:center; font-size:0.7rem; color:#64748b; margin-top:0.5rem;">
                Payment Method: <strong id="receipt-payment-method">CONTACTLESS NFC (VISA •••• 4242)</strong><br>
                Thank you for supporting UK Independent Business.
              </div>
            </div>

            <div style="display:flex; gap:0.5rem; width:100%; max-width:380px; margin-top:1rem;">
              <button class="btn btn-outline" style="flex:1; background:#fff; color:#0f172a;" onclick="window.print()">🖨️ Print Receipt</button>
              <button class="btn btn-primary" style="flex:1;" onclick="PaymentTerminal.finishAndClose()">Done & Finish</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    },

    setProvider(p) {
      this.provider = p;
      document.querySelectorAll('.terminal-tab-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.provider === p);
      });
      const brandLabels = {
        stripe: 'STRIPE TERMINAL UK (BBPOS WisePOS E)',
        square: 'SQUARE READER (UK S7)',
        sumup: 'SUMUP AIR (EMV Contactless)'
      };
      document.getElementById('term-brand-label').textContent = brandLabels[p] || 'TERMINAL';
    },

    toggleKeypad() {
      const kp = document.getElementById('terminal-keypad');
      kp.style.display = kp.style.display === 'none' ? 'grid' : 'none';
    },

    keyPress(k) {
      const statusEl = document.getElementById('term-status-msg');
      if (k === 'clear') {
        this.pinBuffer = '';
        statusEl.textContent = 'PIN Cleared. Please re-enter PIN.';
      } else if (k === 'enter') {
        if (this.pinBuffer.length >= 4) {
          statusEl.textContent = 'Verifying PIN with issuing bank...';
          this.processApproval('CHIP & PIN (MASTERCARD •••• 8812)');
        } else {
          statusEl.textContent = '⚠️ PIN must be at least 4 digits.';
        }
      } else {
        if (this.pinBuffer.length < 6) {
          this.pinBuffer += k;
          statusEl.textContent = 'PIN: ' + '•'.repeat(this.pinBuffer.length);
        }
      }
    },

    openModal(options) {
      this.init();
      this.currentTransaction = options || {
        amount: 15.00,
        orderRef: 'ORD-' + Math.floor(100 + Math.random() * 900),
        items: [{ name: 'Store Purchase', price: 15.00, qty: 1 }],
        onSuccess: null
      };

      document.getElementById('term-amount-display').textContent = '£' + parseFloat(this.currentTransaction.amount).toFixed(2);
      document.getElementById('term-order-ref').textContent = 'Order #' + (this.currentTransaction.orderRef || 'ORD-POS');
      document.getElementById('term-status-msg').textContent = 'Present contactless card or tap phone';
      document.getElementById('terminal-screen-main').style.display = 'flex';
      document.getElementById('terminal-screen-receipt').style.display = 'none';
      this.pinBuffer = '';

      // Reset LEDs
      this.setLeds('ready');

      document.getElementById('terminal-modal').classList.add('active');
    },

    closeModal() {
      const m = document.getElementById('terminal-modal');
      if (m) m.classList.remove('active');
    },

    setLeds(state) {
      const leds = [document.getElementById('led-1'), document.getElementById('led-2'), document.getElementById('led-3'), document.getElementById('led-4')];
      leds.forEach(l => {
        if (!l) return;
        l.className = 'terminal-led';
        if (state === 'ready') l.classList.add('green');
        else if (state === 'reading') l.classList.add('blue');
        else if (state === 'processing') l.classList.add('amber');
        else if (state === 'approved') l.classList.add('green');
      });
    },

    simulateNfcTap() {
      const statusEl = document.getElementById('term-status-msg');
      statusEl.textContent = '📡 Card read. Do not remove card...';
      this.setLeds('reading');

      // Play soft beep if Web Audio API available
      this.playChime();

      setTimeout(() => {
        statusEl.textContent = '🔄 Authorizing with ' + this.provider.toUpperCase() + ' gateway...';
        this.setLeds('processing');

        setTimeout(() => {
          this.processApproval('CONTACTLESS NFC (APPLE PAY •••• 9104)');
        }, 800);
      }, 600);
    },

    processApproval(methodName) {
      const statusEl = document.getElementById('term-status-msg');
      statusEl.textContent = '✅ Payment Approved!';
      this.setLeds('approved');

      const txnId = 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const authCode = 'AUTH_' + Math.floor(100000 + Math.random() * 900000);
      const timestamp = new Date().toLocaleString('en-GB');

      // Construct receipt
      const amount = parseFloat(this.currentTransaction.amount);
      const vatRate = 0.20;
      const net = amount / (1 + vatRate);
      const vat = amount - net;

      document.getElementById('receipt-timestamp').textContent = timestamp;
      document.getElementById('receipt-txnid').textContent = txnId;
      document.getElementById('receipt-authcode').textContent = authCode;
      document.getElementById('receipt-net').textContent = '£' + net.toFixed(2);
      document.getElementById('receipt-vat').textContent = '£' + vat.toFixed(2);
      document.getElementById('receipt-total').textContent = '£' + amount.toFixed(2);
      document.getElementById('receipt-payment-method').textContent = methodName;

      const itemsContainer = document.getElementById('receipt-items-list');
      itemsContainer.innerHTML = '';
      (this.currentTransaction.items || []).forEach(it => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.marginBottom = '2px';
        row.innerHTML = `<span>${it.qty || 1}x ${window.KallistoOS.escapeHtml(it.name)}</span><span>£${((it.price || 0) * (it.qty || 1)).toFixed(2)}</span>`;
        itemsContainer.appendChild(row);
      });

      // Fire simulated webhook event over KallistoOS.bus
      if (window.KallistoOS && window.KallistoOS.bus) {
        window.KallistoOS.bus.emit('payment_completed', {
          transactionId: txnId,
          provider: this.provider,
          authCode: authCode,
          amount: amount,
          orderRef: this.currentTransaction.orderRef,
          items: this.currentTransaction.items,
          method: methodName,
          timestamp: new Date().toISOString()
        });
      }

      // Show receipt screen
      setTimeout(() => {
        document.getElementById('terminal-screen-main').style.display = 'none';
        document.getElementById('terminal-screen-receipt').style.display = 'flex';
      }, 500);
    },

    finishAndClose() {
      if (this.currentTransaction && typeof this.currentTransaction.onSuccess === 'function') {
        this.currentTransaction.onSuccess();
      }
      this.closeModal();
    },

    playChime() {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } catch (e) {
        // AudioContext may be restricted before user gesture
      }
    }
  };

  window.PaymentTerminal = PaymentTerminal;

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PaymentTerminal.init());
  } else {
    PaymentTerminal.init();
  }
})(window);
