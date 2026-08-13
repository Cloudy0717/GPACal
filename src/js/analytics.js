const Analytics = {
  isEnabled: function() {
    return typeof gtag === 'function';
  },

  trackEvent: function(eventName, params = {}) {
    if (!this.isEnabled()) return;
    try {
      gtag('event', eventName, params);
    } catch (e) {
      console.warn('Analytics error:', e);
    }
  },

  trackCalculation: function(type, universitySlug) {
    this.trackEvent('calculation_completed', {
      calculator_type: type,
      university: universitySlug
    });
  },

  trackReset: function(type, universitySlug) {
    this.trackEvent('calculator_reset', {
      calculator_type: type,
      university: universitySlug
    });
  },

  trackUniversitySelected: function(type, universitySlug) {
    this.trackEvent('university_selected', {
      calculator_type: type,
      university: universitySlug
    });
  }
};

window.MST_Analytics = Analytics;
