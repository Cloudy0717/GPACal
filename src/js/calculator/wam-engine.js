const WamEngine = {
  /**
   * Calculates Weighted Average Mark (WAM) using generic weighting rules.
   * @param {Array<{name?: string, mark?: number|string, credits: number, yearLevel: number, specialResult?: string}>} units
   * @param {Object} calculationMethod - e.g. { method: "weighted_mark_average", weighting: { ... } }
   * @param {Array} exclusions - List of special grades with their counting logic
   * @returns {Object}
   */
  calculateWAM: function(units, calculationMethod, exclusions = []) {
    if (!Array.isArray(units) || units.length === 0) {
      return { success: false, errors: ['No units provided.'] };
    }
    if (!calculationMethod || calculationMethod.method !== 'weighted_mark_average') {
      return { success: false, errors: ['Invalid WAM calculation configuration.'] };
    }

    const errors = [];
    let totalWeightedMarks = 0;
    let totalWeightedCredits = 0;
    let excludedCount = 0;
    const unitResults = [];

    // Build exclusion map for quick lookup
    const exclusionMap = new Map();
    exclusions.forEach(ex => {
      if (ex && ex.grade) {
        exclusionMap.set(ex.grade.trim().toUpperCase(), ex);
      }
    });

    units.forEach((unit, index) => {
      const unitId = unit.name ? `Unit "${unit.name}"` : `Unit ${index + 1}`;
      const credits = Number(unit.credits);
      const yearLevel = Number(unit.yearLevel);

      // Validate common fields
      if (isNaN(credits) || credits <= 0) {
        errors.push(`${unitId}: Credits must be a positive number.`);
        return;
      }
      if (isNaN(yearLevel) || yearLevel <= 0 || !Number.isInteger(yearLevel)) {
        errors.push(`${unitId}: Year level must be a positive integer.`);
        return;
      }

      // Determine weighting factor based on configuration
      let weight = 1.0;
      if (calculationMethod.weighting && calculationMethod.weighting.year_level && calculationMethod.weighting.year_level.enabled) {
        const rules = calculationMethod.weighting.year_level.rules || [];
        const specificRule = rules.find(r => r.year_level === yearLevel);
        if (specificRule) {
          weight = specificRule.weight;
        } else {
          const defaultRule = rules.find(r => r.year_level === 'other');
          if (defaultRule) {
            weight = defaultRule.weight;
          }
        }
      }

      // Check if unit is a special result
      if (unit.specialResult && unit.specialResult.trim() !== '') {
        const specialCode = String(unit.specialResult).trim().toUpperCase();
        const exDef = exclusionMap.get(specialCode);
        
        if (!exDef) {
           errors.push(`${unitId}: Special result code '${unit.specialResult}' is not recognized.`);
           return;
        }

        if (exDef.counts.wam === false) {
           excludedCount++;
           unitResults.push({
             name: unit.name,
             credits: credits,
             yearLevel: yearLevel,
             mark: null,
             specialResult: specialCode,
             weightedMark: 0,
             weightedCredits: 0,
             included: false
           });
           return;
        } else if (exDef.counts.wam === true) {
           // E.g. WN (Withdrawn Fail) is counted as 0 mark.
           // We assume the schema assigns a `point` or fallback mark for included special grades.
           const forcedMark = typeof exDef.point === 'number' ? exDef.point : 0;
           const wMark = forcedMark * credits * weight;
           const wCredits = credits * weight;
           
           totalWeightedMarks += wMark;
           totalWeightedCredits += wCredits;
           
           unitResults.push({
             name: unit.name,
             credits: credits,
             yearLevel: yearLevel,
             mark: forcedMark,
             specialResult: specialCode,
             weightedMark: wMark,
             weightedCredits: wCredits,
             included: true
           });
           return;
        }
      }

      // It's a standard numeric mark
      if (unit.mark === undefined || unit.mark === null || String(unit.mark).trim() === '') {
        errors.push(`${unitId}: Missing mark or special result.`);
        return;
      }

      const mark = Number(unit.mark);
      if (isNaN(mark) || mark < 0 || mark > 100) {
        errors.push(`${unitId}: Mark must be between 0 and 100.`);
        return;
      }

      const wMark = mark * credits * weight;
      const wCredits = credits * weight;

      totalWeightedMarks += wMark;
      totalWeightedCredits += wCredits;

      unitResults.push({
        name: unit.name,
        credits: credits,
        yearLevel: yearLevel,
        mark: mark,
        specialResult: null,
        weightedMark: wMark,
        weightedCredits: wCredits,
        included: true
      });
    });

    if (errors.length > 0) {
      return { success: false, errors };
    }

    let wam = 0.000;
    if (totalWeightedCredits > 0) {
      const rawWam = totalWeightedMarks / totalWeightedCredits;
      // Precision defaults to 3 for WAM
      const precision = (calculationMethod.display && typeof calculationMethod.display.precision === 'number') 
                        ? calculationMethod.display.precision 
                        : 3;
      const factor = Math.pow(10, precision);
      wam = Math.round((rawWam + Number.EPSILON) * factor) / factor;
    }

    let resultLabel = 'WAM';
    let resultFormat = 'percentage';
    if (calculationMethod.display) {
      resultLabel = calculationMethod.display.label || resultLabel;
      resultFormat = calculationMethod.display.format || resultFormat;
    }

    return {
      success: true,
      score: wam,
      resultLabel,
      resultFormat,
      totalWeightedMarks,
      totalWeightedCredits,
      includedCount: unitResults.filter(u => u.included).length,
      excludedCount,
      unitResults
    };
  }
};

if (typeof module !== 'undefined') {
  module.exports = WamEngine;
}
