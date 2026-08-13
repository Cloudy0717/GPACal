const Storage = {
  // Schema version added to key to prevent breaking changes when structure updates
  getVersionedKey: function(type, universitySlug) {
    return `mst_${type}_${universitySlug}_v1`;
  },

  saveCalculatorState: function(type, universitySlug, data) {
    try {
      const key = this.getVersionedKey(type, universitySlug);
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('localStorage not available', e);
    }
  },

  loadCalculatorState: function(type, universitySlug) {
    try {
      const key = this.getVersionedKey(type, universitySlug);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('localStorage not available', e);
      return null;
    }
  },

  clearCalculatorState: function(type, universitySlug) {
    try {
      const key = this.getVersionedKey(type, universitySlug);
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('localStorage not available', e);
    }
  },

  saveLastUniversity: function(slug) {
    try {
      localStorage.setItem('mst_last_university', slug);
    } catch (e) {
      console.warn('localStorage not available', e);
    }
  },

  getLastUniversity: function() {
    try {
      return localStorage.getItem('mst_last_university');
    } catch (e) {
      console.warn('localStorage not available', e);
      return null;
    }
  },

  saveIntakeYear: function(universitySlug, year) {
    try {
      localStorage.setItem(`mst_intake_${universitySlug}`, year);
    } catch (e) {
      console.warn('localStorage not available', e);
    }
  },

  loadIntakeYear: function(universitySlug) {
    try {
      return localStorage.getItem(`mst_intake_${universitySlug}`);
    } catch (e) {
      console.warn('localStorage not available', e);
      return null;
    }
  }
};

if (typeof module !== 'undefined') {
  module.exports = Storage;
}

if (typeof window !== 'undefined') {
  window.Storage = Storage;
}
