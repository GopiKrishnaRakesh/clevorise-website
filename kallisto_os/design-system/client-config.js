/**
 * KALLISTO OS - MULTI-CLIENT WHITE-LABEL CONFIGURATION
 * Allows instant customization and theming for different client businesses.
 */

window.KallistoClients = {
  presets: {
    default: {
      id: "kallisto-demo",
      name: "CLEVORISE Flagship Demo",
      tagline: "Omni-Channel Operations Engine",
      type: "hybrid",
      theme: "default",
      currency: "£",
      currencyCode: "GBP",
      locale: "en-GB",
      vatNumber: "GB 418 9021 34",
      regNumber: "12849012",
      address: "London, United Kingdom",
      phone: "0800 525 5478",
      email: "contact@clevorise.co.uk",
      defaultVatRate: 0.20
    },
    cafe: {
      id: "bloom-roast",
      name: "Bloom & Roast Specialty Coffee",
      tagline: "Artisan Roastery & Kitchen",
      type: "hospitality",
      theme: "cafe",
      currency: "£",
      currencyCode: "GBP",
      locale: "en-GB",
      vatNumber: "GB 892 4110 52",
      regNumber: "14298112",
      address: "14 Redchurch Street, Shoreditch, London, E2 7DD",
      phone: "020 7946 0812",
      email: "hello@bloomandroast.co.uk",
      defaultVatRate: 0.20
    },
    retail: {
      id: "harrogate-studio",
      name: "The Harrogate Studio",
      tagline: "Designer Ceramics & Apparel",
      type: "retail",
      theme: "retail",
      currency: "£",
      currencyCode: "GBP",
      locale: "en-GB",
      vatNumber: "GB 302 9182 77",
      regNumber: "15920391",
      address: "8 Montpellier Parade, Harrogate, HG1 2TJ",
      phone: "01423 502891",
      email: "curator@harrogatestudio.co.uk",
      defaultVatRate: 0.20
    },
    services: {
      id: "soho-growth",
      name: "Soho Growth Advisory Ltd",
      tagline: "Digital Growth & Operations Consulting",
      type: "services",
      theme: "services",
      currency: "£",
      currencyCode: "GBP",
      locale: "en-GB",
      vatNumber: "GB 941 2049 63",
      regNumber: "13904812",
      address: "32 Lexington St, Soho, London, W1F 0LQ",
      phone: "020 7946 0991",
      email: "advisory@sohogrowth.co.uk",
      defaultVatRate: 0.20
    },
    fitness: {
      id: "apex-fitness",
      name: "Apex Athletic Club",
      tagline: "Strength, Conditioning & Recovery",
      type: "fitness",
      theme: "fitness",
      currency: "£",
      currencyCode: "GBP",
      locale: "en-GB",
      vatNumber: "GB 512 8931 04",
      regNumber: "16201948",
      address: "Unit 4, Great Ancoats Street, Manchester, M4 5AB",
      phone: "0161 832 9901",
      email: "membership@apexathletic.co.uk",
      defaultVatRate: 0.20
    },
    salon: {
      id: "aura-salon",
      name: "Aura Hair & Aesthetics",
      tagline: "Bespoke Colour, Styling & Medi-Spa",
      type: "salon",
      theme: "salon",
      currency: "£",
      currencyCode: "GBP",
      locale: "en-GB",
      vatNumber: "GB 481 0293 88",
      regNumber: "14820192",
      address: "24 George Street, Edinburgh, EH2 2PQ",
      phone: "0131 225 8890",
      email: "concierge@aurahair.co.uk",
      defaultVatRate: 0.20
    },
    trades: {
      id: "vanguard-trades",
      name: "Vanguard Electrical & Heating",
      tagline: "NICEIC & Gas Safe Certified Contractors",
      type: "trades",
      theme: "trades",
      currency: "£",
      currencyCode: "GBP",
      locale: "en-GB",
      vatNumber: "GB 719 3840 19",
      regNumber: "11928374",
      address: "Colmore Gate, 84 Colmore Row, Birmingham, B3 2BB",
      phone: "0121 200 4810",
      email: "dispatch@vanguardengineering.co.uk",
      defaultVatRate: 0.20
    }
  },

  getCurrentClient() {
    const savedId = localStorage.getItem("kallisto_active_client") || "default";
    return this.presets[savedId] || this.presets.default;
  },

  setClient(clientId) {
    if (this.presets[clientId]) {
      localStorage.setItem("kallisto_active_client", clientId);
      document.documentElement.setAttribute("data-client-theme", this.presets[clientId].theme);
      window.dispatchEvent(new CustomEvent("kallistoClientChanged", { detail: this.presets[clientId] }));
      return true;
    }
    return false;
  },

  initTheme() {
    const current = this.getCurrentClient();
    document.documentElement.setAttribute("data-client-theme", current.theme);
  }
};

// Initialize theme on script load
window.KallistoClients.initTheme();
