# CLEVORISE OS: White-Label Design System & Client Deployment Guide

A modular, minimal, high-contrast design system built specifically for deploying bespoke business operations platforms for independent UK clients across **Retail**, **Hospitality / Food & Drink**, and **Professional Services**.

---

## 1. Quick White-Label Setup for a New Client

To deploy a new client instance:

1. Open `kallisto_os/design-system/client-config.js`.
2. Add your new client preset:
```javascript
presets: {
  myClient: {
    id: "my-client-slug",
    name: "Client Business Name Ltd",
    tagline: "Boutique Artisan Bakery",
    type: "hospitality", // "hospitality" | "retail" | "services"
    theme: "cafe",        // "default" | "cafe" | "retail" | "services"
    currency: "£",
    currencyCode: "GBP",
    locale: "en-GB",
    vatNumber: "GB 123 4567 89",
    regNumber: "14892019",
    address: "12 Church Lane, Oxford, OX1 2AA",
    phone: "01865 204918",
    email: "orders@clientbusiness.co.uk",
    defaultVatRate: 0.20
  }
}
```
3. Set `localStorage.setItem('kallisto_active_client', 'myClient');` or use the topbar client switcher dropdown in the dashboard.

---

## 2. Design Tokens Overview (`design-tokens.css`)

- **Primary Colors**: Controlled via `--brand-primary` and `--brand-primary-hover`.
- **Canvas & Surfaces**: Clean neutral palette with slate typography (`#0f172a` primary text, WCAG AAA contrast ratio >12:1).
- **Client Themes Out-of-the-Box**:
  1. `default`: International Executive Amber (`#ff5d00`) on clean slate canvas.
  2. `cafe`: Roasted Amber Warm Stone (`#b45309`) on creamy linen canvas (`#faf7f2`).
  3. `retail`: Obsidian & Cobalt Indigo (`#0284c7`) on cool high-contrast canvas.
  4. `services`: Deep Indigo & Slate Navy (`#4f46e5`) on crisp executive canvas.
  5. `fitness`: Electric Lime (`#84cc16`) on athletic charcoal slate (`#09090b`).
  6. `salon`: Luxury Berry / Rose Quartz (`#e11d48`) on champagne blush canvas (`#fff5f6`).
  7. `trades`: Industrial High-Vis Amber (`#d97706`) on gunmetal technical canvas (`#0f172a`).

---

## 3. Progressive Web App (PWA) & Tablet Kiosk Mode

CLEVORISE OS includes native PWA support:
- **`manifest.webmanifest`**: Configures app name, icons, standalone full-screen display, and quick shortcuts for Kiosk, KDS, Stock, and Invoices.
- **`sw.js`**: Service Worker caching all static assets and engines for offline counter operation.
- **Kiosk Mode**: Trigger full-screen tablet lock using `KallistoOS.toggleKioskMode()`.

---

## 4. Payment Terminal & Webhook Simulator (`payment-terminal.js`)

Simulates contactless in-person card payments:
- **Supported Terminal Hardware**: Stripe Terminal UK (BBPOS WisePOS E), Square Reader UK, SumUp Air.
- **Payment Methods**: Contactless NFC (Apple Pay, Google Pay, Visa/Mastercard), Chip & PIN keypad simulator, Faster Payments UK QR.
- **Event Bus Integration**: Dispatches `payment_completed` webhooks across `KallistoOS.bus`, auto-triggering inventory deductions, VAT ledger entries, and digital receipt generation.

---

## 5. UI Component Library (`components.css`)

All components are built with pure Vanilla CSS and zero bloated dependencies:
- **Navigation**: Collapsible sidebar with active icon indicators and section headings.
- **Data Tables**: Striped, hoverable, responsive tables for invoices, inventory, and shift logs.
- **Stat Cards**: Metric badges with trend indicators (positive, negative, neutral).
- **Action Buttons**: `.os-btn-primary`, `.os-btn-secondary`, `.os-btn-danger`, `.os-btn-sm`.
- **Live Pulse**: `.os-pulse-dot` indicating autonomous background processing without human intervention.

