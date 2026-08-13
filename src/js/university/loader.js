const UniversityLoader = {
  getUniversityData: function(slug) {
    if (typeof window === 'undefined' || !window.__UNIVERSITY_DATA__) return null;
    return window.__UNIVERSITY_DATA__[slug] || null;
  },

  getUniversityList: function() {
    if (typeof window === 'undefined' || !window.__UNIVERSITY_REGISTRY__) return [];
    return window.__UNIVERSITY_REGISTRY__;
  },

  /**
   * Resolves the applicable academic rule for a student.
   * @param {Object} universityData - The university JSON schema
   * @param {Object} constraints - Options like { programme: string, intakeDate: string|Date }
   * @returns {Object|null} The resolved academic rule or null if none found
   */
  resolveAcademicRule: function(universityData, constraints = {}) {
    if (!universityData || !Array.isArray(universityData.academic_rules)) return null;
    if (universityData.academic_rules.length === 0) return null;
    
    let applicableRules = universityData.academic_rules;

    // 1. Filter by Intake Date if provided
    if (constraints.intakeDate) {
      // Normalize intake Date to timestamp
      const intake = new Date(constraints.intakeDate).getTime();
      
      applicableRules = applicableRules.filter(rule => {
        const effectiveFrom = rule.effective_from ? new Date(rule.effective_from).getTime() : -Infinity;
        // If effective_to exists, we use it. 
        // Note: For string dates like '2023-12-31', JS parses to UTC midnight. To make it inclusive of that day entirely, 
        // one might add 86400000ms, but for standard comparison against intakeDate (which is typically YYYY-MM-DD), this works.
        const effectiveTo = rule.effective_to ? new Date(rule.effective_to).getTime() : Infinity;
        
        return intake >= effectiveFrom && intake <= effectiveTo;
      });
    }

    // Future: Match `constraints.programme` with `scopes` against `rule.scope_id`

    // If no specific rules match perfectly after filtering, return null to force the UI to handle the error.
    if (constraints.intakeDate && applicableRules.length === 0) return null;
    
    // Fall back to the first available rule for MVP if no constraints provided
    return applicableRules.length > 0 ? applicableRules[0] : null;
  },

  /**
   * Gets the active grading scale from a resolved academic rule.
   */
  getGradingScale: function(academicRule) {
    if (!academicRule || !Array.isArray(academicRule.grading_scales) || academicRule.grading_scales.length === 0) {
      return null;
    }
    return academicRule.grading_scales[0];
  }
};

if (typeof module !== 'undefined') {
  module.exports = UniversityLoader;
}
