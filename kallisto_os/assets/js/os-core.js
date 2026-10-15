/**
 * KALLISTO OS - CORE STATE & EVENT BUS
 * Centralized reactive data store for all autonomous business modules.
 */

window.KallistoOS = {
  STORAGE_KEY: 'kallisto_os_store_v4',

  // Event Bus for cross-module reactive synchronization
  bus: {
    events: {},
    on(event, callback) {
      if (!this.events[event]) this.events[event] = [];
      this.events[event].push(callback);
    },
    emit(event, data) {
      if (this.events[event]) {
        this.events[event].forEach(cb => cb(data));
      }
      // Broadcast to window for custom listeners
      window.dispatchEvent(new CustomEvent(`kallisto:${event}`, { detail: data }));
    }
  },

  // Default seed database for UK small business operations
  getInitialState() {
    return {
      activeClientId: 'default',
      invoices: [
        {
          id: 'INV-2026-0819',
          clientName: 'The Yorkshire Pantry Ltd',
          clientEmail: 'accounts@yorkshirepantry.co.uk',
          clientVat: 'GB 781 9201 12',
          date: '2026-09-01',
          dueDate: '2026-09-15',
          status: 'paid',
          subtotal: 1250.00,
          vatRate: 0.20,
          vatAmount: 250.00,
          total: 1500.00,
          items: [
            { desc: 'Weekly Artisan Stock Wholesale Delivery', qty: 25, unitPrice: 38.00, amount: 950.00 },
            { desc: 'Express Courier & Temperature Controlled Freight', qty: 1, unitPrice: 300.00, amount: 300.00 }
          ]
        },
        {
          id: 'INV-2026-0820',
          clientName: 'Cotswolds Artisan Living',
          clientEmail: 'finance@cotswoldsartisan.co.uk',
          clientVat: 'GB 612 8904 22',
          date: '2026-09-08',
          dueDate: '2026-09-22',
          status: 'sent',
          subtotal: 780.00,
          vatRate: 0.20,
          vatAmount: 156.00,
          total: 936.00,
          items: [
            { desc: 'Handcrafted Stoneware Espresso Cups (Set of 6)', qty: 12, unitPrice: 45.00, amount: 540.00 },
            { desc: 'Ceramic Pour-Over Dripper Display Units', qty: 6, unitPrice: 40.00, amount: 240.00 }
          ]
        },
        {
          id: 'INV-2026-0814',
          clientName: 'Mayfair Boutique Hotel',
          clientEmail: 'procurement@mayfairsuites.london',
          clientVat: 'GB 921 5402 18',
          date: '2026-08-10',
          dueDate: '2026-08-24',
          status: 'overdue',
          subtotal: 2100.00,
          vatRate: 0.20,
          vatAmount: 420.00,
          total: 2520.00,
          items: [
            { desc: 'Quarterly Bespoke Scent & Ceramic Amenities', qty: 1, unitPrice: 2100.00, amount: 2100.00 }
          ]
        }
      ],
      inventory: [
        {
          id: 'SKU-COF-01',
          name: 'Ethiopian Yirgacheffe Beans (1kg)',
          category: 'Coffee & Roastery',
          stock: 18,
          minThreshold: 8,
          costPrice: 11.50,
          sellPrice: 26.00,
          supplier: 'Direct Origin Roasters Leeds',
          supplierEmail: 'wholesale@directorigin.co.uk',
          barcode: '506089201001',
          portionUnit: 'g',
          portionsPerUnit: 1000, // 1kg bag = 1,000g
          autoReorderQty: 20
        },
        {
          id: 'SKU-COF-02',
          name: 'Colombian Huila Single Origin (1kg)',
          category: 'Coffee & Roastery',
          stock: 5, // LOW STOCK - TRIGGER AUTO-PO
          minThreshold: 8,
          costPrice: 9.80,
          sellPrice: 24.00,
          supplier: 'Direct Origin Roasters Leeds',
          supplierEmail: 'wholesale@directorigin.co.uk',
          barcode: '506089201002',
          portionUnit: 'g',
          portionsPerUnit: 1000, // 1kg bag = 1,000g
          autoReorderQty: 25
        },
        {
          id: 'SKU-MLK-01',
          name: 'Oat Milk Barista Edition (Case of 6)',
          category: 'Dairy & Alternatives',
          stock: 4, // LOW STOCK
          minThreshold: 10,
          costPrice: 8.50,
          sellPrice: 18.00,
          supplier: 'Minor Figures UK Distribution',
          supplierEmail: 'orders@minorfigures.com',
          barcode: '506089201003',
          autoReorderQty: 15
        },
        {
          id: 'SKU-CER-01',
          name: 'Glaze Terracotta KeepCup 350ml',
          category: 'Ceramics & Retail',
          stock: 24,
          minThreshold: 6,
          costPrice: 8.00,
          sellPrice: 28.00,
          supplier: 'Yorkshire Potteries Cooperative',
          supplierEmail: 'trade@yorkshirepotteries.co.uk',
          barcode: '506089201004',
          autoReorderQty: 12
        },
        {
          id: 'SKU-BAK-01',
          name: 'Artisan Sourdough Loaf (Daily)',
          category: 'Bakery & Food',
          stock: 14,
          minThreshold: 5,
          costPrice: 1.40,
          sellPrice: 4.80,
          supplier: 'Local Mill & Bakehouse',
          supplierEmail: 'orders@localmill.co.uk',
          barcode: '506089201005',
          portionUnit: 'slices',
          portionsPerUnit: 12, // one loaf = 12 slices
          autoReorderQty: 20
        },
        {
          id: 'SKU-BAK-02',
          name: 'Almond Frangipane Croissant',
          category: 'Bakery & Food',
          stock: 24,
          minThreshold: 8,
          costPrice: 1.10,
          sellPrice: 4.20,
          supplier: 'Local Mill & Bakehouse',
          supplierEmail: 'orders@localmill.co.uk',
          barcode: '506089201006',
          autoReorderQty: 24
        }
      ],
      menu: [
        {
          id: 'MNU-01',
          name: 'Single Origin Flat White',
          price: 3.80,
          category: 'Hot Drinks',
          desc: 'Double ristretto with micro-foamed organic whole or oat milk.',
          dietary: ['Vegetarian'],
          linkedSku: 'SKU-COF-01',
          portionsPerSale: 18, // 18g of beans per flat white
          ingredients: ['Espresso', 'Steamed Milk'],
          image: '../assets/images/boutique-interior.webp'
        },
        {
          id: 'MNU-02',
          name: 'Batch Brew Colombian Filter',
          price: 3.40,
          category: 'Hot Drinks',
          desc: 'Smooth, fruit-forward black coffee brewed fresh hourly.',
          dietary: ['Vegan', 'Gluten-Free'],
          linkedSku: 'SKU-COF-02',
          portionsPerSale: 15, // 15g of beans per filter serving
          ingredients: ['Colombian Huila', 'Filtered Water'],
          image: '../assets/images/boutique-interior.webp'
        },
        {
          id: 'MNU-03',
          name: 'Almond Frangipane Croissant',
          price: 4.20,
          category: 'Bakery & Pastries',
          desc: 'Twice-baked butter croissant filled with almond cream and topped with flaked almonds.',
          dietary: ['Vegetarian'],
          linkedSku: 'SKU-BAK-02',
          ingredients: ['French Butter', 'Almond Flour'],
          image: '../assets/images/boutique-display.webp'
        },
        {
          id: 'MNU-04',
          name: 'Artisan Avocado Toast & Dukkah',
          price: 8.50,
          category: 'Kitchen & Brunch',
          desc: 'Crushed Hass avocado on toasted sourdough with house seed dukkah and cold-pressed olive oil.',
          dietary: ['Vegan'],
          linkedSku: 'SKU-BAK-01',
          portionsPerSale: 2, // 2 slices per avocado toast
          ingredients: ['Sourdough', 'Avocado', 'Egyptian Dukkah'],
          image: '../assets/images/boutique-display.webp'
        },
        {
          id: 'MNU-05',
          name: 'Glaze Terracotta KeepCup 350ml',
          price: 28.00,
          category: 'Retail Goods',
          desc: 'Hand-thrown durable stoneware mug with matte glaze.',
          dietary: ['Eco-Friendly'],
          linkedSku: 'SKU-CER-01',
          ingredients: [],
          image: '../assets/images/boutique-display.webp'
        }
      ],
      orders: [
        {
          id: 'ORD-1092',
          table: 'Table 4',
          customer: 'Sarah Jenkins',
          time: '12:08',
          status: 'preparing', // pending, preparing, ready, dispatched
          items: [
            { name: 'Single Origin Flat White', qty: 2, price: 3.80, notes: 'Oat Milk' },
            { name: 'Almond Frangipane Croissant', qty: 1, price: 4.20, notes: 'Warmed' }
          ],
          total: 11.80
        },
        {
          id: 'ORD-1093',
          table: 'Takeaway #18',
          customer: 'David Patel',
          time: '12:12',
          status: 'ready',
          items: [
            { name: 'Batch Brew Colombian Filter', qty: 1, price: 3.40, notes: 'Black' }
          ],
          total: 3.40
        }
      ],
      staff: [
        {
          id: 'STF-01',
          name: 'Oliver Thorne',
          role: 'Head Barista & Roaster',
          rate: 14.50,
          weeklyHours: 36,
          status: 'clocked-in',
          shifts: ['Mon 07:00-15:30', 'Tue 07:00-15:30', 'Thu 07:00-15:30', 'Fri 07:00-15:30']
        },
        {
          id: 'STF-02',
          name: 'Emma Watson-Reid',
          role: 'Assistant Manager',
          rate: 15.00,
          weeklyHours: 40,
          status: 'clocked-in',
          shifts: ['Wed 08:00-17:00', 'Thu 08:00-17:00', 'Fri 08:00-17:00', 'Sat 08:30-17:30']
        },
        {
          id: 'STF-03',
          name: 'Liam Davies',
          role: 'Store Associate',
          rate: 12.00, // Meets UK National Living Wage >= £11.44
          weeklyHours: 24,
          status: 'scheduled',
          shifts: ['Sat 09:00-17:00', 'Sun 09:30-16:30']
        }
      ],
      financials: {
        monthlyTarget: 38000.00,
        fixedRent: 3200.00,
        fixedUtilities: 750.00,
        softwareSubscriptions: 180.00,
        marketingSpend: 650.00,
        cogsRate: 0.28 // 28% average COGS
      },
      automations: [
        {
          id: 'AUT-01',
          title: 'Stock Auto-Replenishment Engine',
          trigger: 'When SKU stock dips below minThreshold',
          action: 'Draft supplier PO with autoReorderQty & notify via email',
          enabled: true,
          executionsCount: 42
        },
        {
          id: 'AUT-02',
          title: 'Instant Tax Invoice & Revenue Sync',
          trigger: 'When POS / Self-Order is dispatched',
          action: 'Record revenue line, compute 20% VAT, and update live P&L',
          enabled: true,
          executionsCount: 189
        },
        {
          id: 'AUT-03',
          title: 'UK Statutory Late Payment Chaser',
          trigger: 'When Invoice status becomes overdue (>14 days past due)',
          action: 'Calculate £40 statutory fee + 8% BoE interest notice',
          enabled: true,
          executionsCount: 7
        },
        {
          id: 'AUT-04',
          title: 'Real-Time Labour Guard',
          trigger: 'When weekly labour cost exceeds 30% of projected revenue',
          action: 'Flag shift rota warning to prevent margin erosion',
          enabled: true,
          executionsCount: 12
        }
      ],
      automationLogs: [
        { time: '12:12:04', event: 'ORDER_DISPATCHED', detail: 'ORD-1093 marked ready. Revenue +£3.40 logged to P&L.' },
        { time: '11:45:18', event: 'STOCK_CHECK', detail: 'SKU-COF-02 (Colombian Huila) at 5kg (Min: 8kg). Autonomous PO draft #PO-2026-039 generated for 25kg.' },
        { time: '09:00:00', event: 'ROTA_AUDIT', detail: 'Shift started: 2 staff clocked in. Current labour ratio 24.2% (Target: <28%).' },
        { time: '08:30:12', event: 'VAT_RECONCILIATION', detail: 'HMRC MTD daily ledger synced: £112.40 output VAT tracked.' }
      ]
    };
  },

  // Load state from localStorage or initialize with seed data
  getState() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load storage, using seed data:', e);
    }
    const seed = this.getInitialState();
    this.saveState(seed);
    return seed;
  },

  // Escape user-entered text before it is placed into innerHTML
  escapeHtml(text) {
    return String(text == null ? '' : text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },

  // Persist state to localStorage and notify listeners
  saveState(state) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
      this.bus.emit('stateSaved', state);
    } catch (e) {
      console.error('Storage write error:', e);
    }
  },

  // Autonomous Logger Helper
  logAutomation(event, detail) {
    const state = this.getState();
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    state.automationLogs.unshift({ time: timeStr, event, detail });
    if (state.automationLogs.length > 50) state.automationLogs.pop();
    this.saveState(state);
    this.bus.emit('automationLogged', { time: timeStr, event, detail });
  },

  // Shared Navigation Renderer (Sidebar)
  renderSidebar(activePage) {
    const client = window.KallistoClients ? window.KallistoClients.getCurrentClient() : { name: 'CLEVORISE Flagship', type: 'hybrid' };
    const navItems = [
      { id: 'dashboard', label: 'Mission Control', href: 'index.html', icon: 'dashboard' },
      { id: 'invoicing', label: 'Invoices & VAT (MTD)', href: 'invoice-generator.html', icon: 'receipt_long' },
      { id: 'stock', label: 'Stock & Inventory', href: 'stock-management.html', icon: 'inventory_2' },
      { id: 'menu', label: 'Menu Editor', href: 'menu-editor.html', icon: 'restaurant_menu' },
      { id: 'ordering', label: 'Self-Ordering Kiosk', href: 'self-ordering.html', icon: 'touch_app' },
      { id: 'kds', label: 'Kitchen & Dispatch (KDS)', href: 'kitchen-display.html', icon: 'soup_kitchen' },
      { id: 'rota', label: 'Staff & Labour Rota', href: 'staff-deployment.html', icon: 'badge' },
      { id: 'forecast', label: 'Sales & P&L Forecast', href: 'financial-forecast.html', icon: 'trending_up' },
      { id: 'seo', label: 'UK Local SEO & Growth', href: 'seo-marketing.html', icon: 'query_stats' },
      { id: 'automations', label: 'Autonomous Rules Engine', href: 'automation-rules.html', icon: 'smart_toy' }
    ];

    const sidebar = document.querySelector('.os-sidebar');
    if (!sidebar) return;

    sidebar.innerHTML = `
      <div class="os-sidebar-header">
        <a href="index.html" class="os-brand-badge">
          <div class="os-brand-logo">C</div>
          <div>
            <div style="font-weight: 700; font-size: 0.9375rem; letter-spacing: -0.01em;">${client.name}</div>
            <div style="font-size: 0.6875rem; color: var(--text-inverse-muted); text-transform: uppercase;">CLEVORISE OS • UK</div>
          </div>
        </a>
      </div>
      
      <div class="os-sidebar-nav">
        <div class="os-nav-section-title">Core Operations</div>
        ${navItems.slice(0, 6).map(item => `
          <a href="${item.href}" class="os-nav-item ${activePage === item.id ? 'active' : ''}">
            <span class="material-symbols-outlined">${item.icon}</span>
            <span>${item.label}</span>
          </a>
        `).join('')}

        <div class="os-nav-section-title">Intelligence & Labour</div>
        ${navItems.slice(6).map(item => `
          <a href="${item.href}" class="os-nav-item ${activePage === item.id ? 'active' : ''}">
            <span class="material-symbols-outlined">${item.icon}</span>
            <span>${item.label}</span>
          </a>
        `).join('')}
      </div>

      <div class="os-sidebar-footer">
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0.25rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="os-pulse-dot"></span>
            <span style="font-size: 0.75rem; color: var(--text-inverse-muted); font-weight: 500;">Autonomous Engine Active</span>
          </div>
          <a href="../index.html" style="color: var(--text-inverse-muted); text-decoration: none; font-size: 0.75rem; display: flex; align-items: center;" title="Back to Public Site">
            <span class="material-symbols-outlined text-[18px]">exit_to_app</span>
          </a>
        </div>
      </div>
    `;
  },

  // Topbar Client Switcher & Notifications
  renderTopbar(pageTitle) {
    const topbar = document.querySelector('.os-topbar');
    if (!topbar) return;

    const currentClient = window.KallistoClients ? window.KallistoClients.getCurrentClient() : { id: 'default' };

    topbar.innerHTML = `
      <div class="os-topbar-title" style="display: flex; align-items: center; gap: 1rem;">
        <button type="button" class="os-btn os-btn-secondary os-btn-sm" id="toggle-mobile-sidebar">
          <span class="material-symbols-outlined">menu</span>
        </button>
        <h1 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; color: var(--text-primary);">
          ${pageTitle}
        </h1>
      </div>

      <div class="os-topbar-actions" style="display: flex; align-items: center; gap: 0.75rem;">
        <!-- Client Business White-Label Switcher -->
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <label for="client-select" class="os-topbar-label" style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">
            Client Mode:
          </label>
          <select id="client-select" class="os-select" style="padding: 0.35rem 0.75rem; font-size: 0.8125rem; font-weight: 600; width: auto;">
            <option value="default" ${currentClient.id === 'kallisto-demo' ? 'selected' : ''}>Flagship Omni-Retail</option>
            <option value="cafe" ${currentClient.id === 'bloom-roast' ? 'selected' : ''}>Bloom & Roast Coffee (Hospitality)</option>
            <option value="retail" ${currentClient.id === 'harrogate-studio' ? 'selected' : ''}>The Harrogate Studio (Boutique)</option>
            <option value="services" ${currentClient.id === 'soho-growth' ? 'selected' : ''}>Soho Growth Advisory (Services)</option>
            <option value="fitness" ${currentClient.id === 'apex-fitness' ? 'selected' : ''}>Apex Athletic Club (Fitness & Gym)</option>
            <option value="salon" ${currentClient.id === 'aura-salon' ? 'selected' : ''}>Aura Hair & Aesthetics (Salon/Spa)</option>
            <option value="trades" ${currentClient.id === 'vanguard-trades' ? 'selected' : ''}>Vanguard Electrical (Trade Services)</option>
          </select>
        </div>

        <div class="os-topbar-divider" style="height: 20px; width: 1px; background-color: var(--border-subtle);"></div>

        <!-- Fullscreen Kiosk Mode Trigger -->
        <button type="button" class="os-btn os-btn-secondary os-btn-sm" id="btn-kiosk-fullscreen" onclick="KallistoOS.toggleKioskMode()" title="Toggle Fullscreen Kiosk Mode for Tablets / Counters">
          <span class="material-symbols-outlined text-[16px]">fullscreen</span>
          <span class="os-btn-label">Kiosk View</span>
        </button>

        <!-- Install PWA App Button (Hidden until installable) -->
        <button type="button" class="os-btn os-btn-secondary os-btn-sm" id="btn-install-pwa" style="display:none;" onclick="KallistoOS.promptPwaInstall()" title="Install CLEVORISE OS as Standalone Desktop/Tablet App">
          <span class="material-symbols-outlined text-[16px]">download_for_offline</span>
          <span class="os-btn-label">Install App</span>
        </button>

        <a href="self-ordering.html" target="_blank" class="os-btn os-btn-primary os-btn-sm" title="Launch Customer Self-Ordering Kiosk">
          <span class="material-symbols-outlined text-[16px]">qr_code_scanner</span>
          <span class="os-btn-label">Open Kiosk</span>
        </a>
      </div>
    `;

    const select = topbar.querySelector('#client-select');
    if (select) {
      select.addEventListener('change', (e) => {
        window.KallistoClients.setClient(e.target.value);
        window.location.reload();
      });
    }

    const mobileBtn = topbar.querySelector('#toggle-mobile-sidebar');
    const sidebar = document.querySelector('.os-sidebar');
    if (mobileBtn && sidebar) {
      // Visibility is handled in os-theme.css (<=900px) so it tracks rotation/resizes
      mobileBtn.style.removeProperty('display');
      mobileBtn.setAttribute('aria-label', 'Open navigation menu');
      mobileBtn.setAttribute('aria-expanded', 'false');

      let backdrop = document.querySelector('.os-sidebar-backdrop');
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'os-sidebar-backdrop';
        backdrop.setAttribute('aria-hidden', 'true');
        document.body.appendChild(backdrop);
      }

      const setOpen = (open) => {
        sidebar.classList.toggle('open', open);
        backdrop.classList.toggle('open', open);
        mobileBtn.setAttribute('aria-expanded', String(open));
      };

      mobileBtn.addEventListener('click', () => setOpen(!sidebar.classList.contains('open')));
      backdrop.addEventListener('click', () => setOpen(false));
      sidebar.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    }

    // Check if PWA install prompt is ready
    if (window.KallistoOS.deferredPrompt) {
      const installBtn = topbar.querySelector('#btn-install-pwa');
      if (installBtn) installBtn.style.display = 'inline-flex';
    }
  },

  // Fullscreen Kiosk Mode
  toggleKioskMode() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Error attempting fullscreen kiosk mode: ${err.message}`);
      });
      document.body.classList.add('os-kiosk-locked');
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      document.body.classList.remove('os-kiosk-locked');
    }
  },

  // PWA Install Prompt
  promptPwaInstall() {
    if (window.KallistoOS.deferredPrompt) {
      window.KallistoOS.deferredPrompt.prompt();
      window.KallistoOS.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('[Kallisto PWA] User accepted the install prompt');
        }
        window.KallistoOS.deferredPrompt = null;
        const installBtn = document.getElementById('btn-install-pwa');
        if (installBtn) installBtn.style.display = 'none';
      });
    }
  }
};

// Register PWA Service Worker & capture install prompt
if (typeof window !== 'undefined') {
  window.KallistoOS.deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.KallistoOS.deferredPrompt = e;
    const installBtn = document.getElementById('btn-install-pwa');
    if (installBtn) installBtn.style.display = 'inline-flex';
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/kallisto_os/sw.js', { scope: '/kallisto_os/' })
        .then(reg => console.log('[CLEVORISE OS] Service Worker registered with scope:', reg.scope))
        .catch(err => console.warn('[CLEVORISE OS] SW registration failed:', err));
    });
  }
}

