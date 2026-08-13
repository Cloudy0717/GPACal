const Validation = {
  /**
   * Validates credit hours input for a single course.
   * Must be a positive number, typically in 1-20 range.
   * Rejects 0, negative, non-numeric, or numbers > 20.
   */
  validateCredits(value) {
    if (value === null || value === undefined || value === '') {
      return { valid: false, value: 0, error: 'Credit hours are required' };
    }

    const parsed = Number(value);
    if (isNaN(parsed) || !isFinite(parsed)) {
      return { valid: false, value: 0, error: 'Credit hours must be a valid number' };
    }

    if (parsed <= 0) {
      return { valid: false, value: parsed, error: 'Credit hours must be greater than 0' };
    }

    if (parsed > 20) {
      return { valid: false, value: parsed, error: 'Credit hours must be 20 or less' };
    }

    return { valid: true, value: parsed, error: null };
  },

  /**
   * Validates grade selection against provided grading scale.
   */
  validateGrade(grade, gradingScale) {
    if (!grade || (typeof grade !== 'string' && typeof grade !== 'number')) {
      return { valid: false, error: 'Grade selection is required' };
    }

    if (!gradingScale) {
      return { valid: false, error: 'Grading scale is missing' };
    }

    let exists = false;

    if (Array.isArray(gradingScale)) {
      exists = gradingScale.some(item => {
        if (typeof item === 'string') return item === grade;
        if (typeof item === 'object' && item !== null) {
          return item.grade === grade || item.code === grade || item.letter === grade;
        }
        return false;
      });
    } else if (typeof gradingScale === 'object') {
      exists = Object.prototype.hasOwnProperty.call(gradingScale, grade) || grade in gradingScale;
    }

    if (!exists) {
      return { valid: false, error: `Selected grade "${grade}" does not exist in the grading scale` };
    }

    return { valid: true, error: null };
  },

  /**
   * Validates semester GPA input.
   * GPA must be between 0 and maximum scale (default 4.0).
   */
  validateSemesterGPA(gpa, scale = 4.0) {
    const maxScale = (typeof scale === 'number' && !isNaN(scale) && scale > 0) ? scale : 4.0;

    if (gpa === null || gpa === undefined || gpa === '') {
      return { valid: false, value: 0, error: 'GPA is required' };
    }

    const parsed = Number(gpa);
    if (isNaN(parsed) || !isFinite(parsed)) {
      return { valid: false, value: 0, error: 'GPA must be a valid number' };
    }

    if (parsed < 0 || parsed > maxScale) {
      return { valid: false, value: parsed, error: `GPA must be between 0 and ${maxScale}` };
    }

    return { valid: true, value: parsed, error: null };
  },

  /**
   * Validates total credit hours for a semester.
   * Rejects 0, negative, non-numeric, or values > 100.
   */
  validateSemesterCredits(credits) {
    if (credits === null || credits === undefined || credits === '') {
      return { valid: false, value: 0, error: 'Semester credits are required' };
    }

    const parsed = Number(credits);
    if (isNaN(parsed) || !isFinite(parsed)) {
      return { valid: false, value: 0, error: 'Semester credits must be a valid number' };
    }

    if (parsed <= 0) {
      return { valid: false, value: parsed, error: 'Semester credits must be greater than 0' };
    }

    if (parsed > 100) {
      return { valid: false, value: parsed, error: 'Semester credits cannot exceed 100' };
    }

    return { valid: true, value: parsed, error: null };
  }
};

if (typeof module !== 'undefined') module.exports = Validation;

if (typeof window !== 'undefined') {
  window.Validation = Validation;
}
