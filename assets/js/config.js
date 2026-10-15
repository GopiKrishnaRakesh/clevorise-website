/**
 * CLEVORISE - SITE CONFIGURATION
 *
 * recipientEmail: Target inbox for business consultation requests.
 * formEndpoint: Active submission endpoint. Defaults to FormSubmit sending directly to contact@clevorise.co.uk.
 * Can also be switched to Formspree (https://formspree.io/f/XXXX) at any time.
 */
window.CLEVORISE_CONFIG = {
  recipientEmail: 'contact@clevorise.co.uk',
  formEndpoint: 'https://formsubmit.co/ajax/contact@clevorise.co.uk'
};

// Backward compatibility aliases
window.COREWISECORP_CONFIG = window.CLEVORISE_CONFIG;
window.COREWISECROP_CONFIG = window.CLEVORISE_CONFIG;
window.KALLISTO_CONFIG = window.CLEVORISE_CONFIG;
