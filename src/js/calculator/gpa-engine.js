const GpaEngine = {
  /**
   * Calculates GPA for a list of courses given a schema v2 grading scale.
   * @param {Array<{name?: string, credits: number, grade: string|number}>} courses
   * @param {Object} gradingScale - The v2 grading_scale object (contains `grades` array with `counts` logic)
   * @param {Object} [calculationMethod=null] - Optional config for output display
   * @returns {Object}
   */
  calculateGPA: function(courses, gradingScale, calculationMethod = null) {
    if (!Array.isArray(courses) || courses.length === 0) {
      return { success: false, errors: ['No courses provided.'] };
    }
    if (!gradingScale || !Array.isArray(gradingScale.grades)) {
      return { success: false, errors: ['Invalid grading configuration.'] };
    }

    const errors = [];
    const scaleMap = new Map();
    for (const item of gradingScale.grades) {
      if (item && item.grade !== undefined && item.counts) {
        scaleMap.set(String(item.grade).trim().toUpperCase(), item);
      }
    }

    const inputType = gradingScale.input_type || 'grade';
    
    const resolveGradeBucket = (inputValue) => {
      if (inputType === 'grade') {
        if (typeof inputValue !== 'string') return null;
        return scaleMap.get(String(inputValue).trim().toUpperCase()) || null;
      } else if (inputType === 'mark') {
        const mark = Number(inputValue);
        if (isNaN(mark)) return null;
        return gradingScale.grades.find(g => 
          typeof g.min_mark === 'number' && typeof g.max_mark === 'number' && 
          mark >= g.min_mark && mark <= g.max_mark
        ) || null;
      }
      return null;
    };

    let totalCredits = 0;
    let totalQualityPoints = 0;
    const courseResults = [];

    courses.forEach((course, index) => {
      const courseId = course.name ? `Course "${course.name}"` : `Course ${index + 1}`;
      
      if (!course || course.grade === undefined || course.grade === null || course.grade === '') {
        errors.push(`${courseId}: Missing or invalid grade.`);
        return;
      }

      const gradeDef = resolveGradeBucket(course.grade);

      if (!gradeDef) {
        errors.push(`${courseId}: Input '${course.grade}' could not be resolved to a valid grading bucket.`);
        return;
      }

      const credits = Number(course.credits);
      if (isNaN(credits) || credits < 0) {
        errors.push(`${courseId}: Credits must be a positive number.`);
        return;
      }
      if (credits === 0) {
        errors.push(`${courseId}: Credits cannot be zero.`);
        return;
      }

      if (gradeDef.counts.gpa === false || gradeDef.counts.credits === false) {
        courseResults.push({
          name: course.name,
          credits: credits,
          grade: course.grade,
          point: null,
          qualityPoints: 0,
          includedInGPA: false
        });
      } else {
        const point = gradeDef.point;
        if (typeof point !== 'number') {
           errors.push(`${courseId}: Grade '${course.grade}' counts towards GPA but lacks a numeric grade point.`);
           return;
        }

        const qualityPoints = credits * point; 
        totalCredits += credits;
        totalQualityPoints += qualityPoints;

        courseResults.push({
          name: course.name,
          credits: credits,
          grade: course.grade,
          point: point,
          qualityPoints: qualityPoints,
          includedInGPA: true
        });
      }
    });

    if (errors.length > 0) {
      return { success: false, errors };
    }

    let gpa = 0.00;
    if (totalCredits > 0) {
      const rawGpa = totalQualityPoints / totalCredits;
      gpa = Math.round((rawGpa + Number.EPSILON) * 100) / 100;
    }

    let resultLabel = 'GPA';
    let resultFormat = '4_point';
    if (calculationMethod && calculationMethod.display) {
      resultLabel = calculationMethod.display.label || resultLabel;
      resultFormat = calculationMethod.display.format || resultFormat;
    }

    return {
      success: true,
      gpa,
      resultLabel,
      resultFormat,
      totalCredits,
      totalQualityPoints,
      courseResults
    };
  }
};

if (typeof module !== 'undefined') {
  module.exports = GpaEngine;
}
