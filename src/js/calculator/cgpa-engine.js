const CgpaEngine = {
  /**
   * Calculates CGPA across multiple semesters.
   * @param {Array<{name?: string, gpa: number, credits: number}>} semesters
   * @returns {Object} { success: boolean, cgpa?: number, totalCredits?: number, totalQualityPoints?: number, semesterResults?: Array, errors?: Array<string> }
   */
  calculateCGPA: function(semesters) {
    if (!Array.isArray(semesters) || semesters.length === 0) {
      return { success: false, errors: ['No semesters provided.'] };
    }

    const errors = [];
    let totalCredits = 0;
    let totalQualityPoints = 0;
    const semesterResults = [];

    semesters.forEach((sem, index) => {
      const semId = sem.name ? `Semester "${sem.name}"` : `Semester ${index + 1}`;
      
      if (!sem) {
        errors.push(`${semId}: Invalid semester data.`);
        return;
      }

      const gpa = Number(sem.gpa);
      const credits = Number(sem.credits);

      if (isNaN(gpa) || gpa < 0) {
        errors.push(`${semId}: GPA must be a positive number.`);
      }
      if (isNaN(credits) || credits <= 0) {
        errors.push(`${semId}: Credits must be a positive number greater than zero.`);
      }

      if (errors.length === 0 && !isNaN(gpa) && !isNaN(credits) && credits > 0 && gpa >= 0) {
        // Re-calculate the quality points for the semester without rounding
        // CGPA = sum(GPA * Credits) / sum(Credits)
        const qp = gpa * credits; 
        totalQualityPoints += qp;
        totalCredits += credits;
        
        semesterResults.push({
          name: sem.name,
          gpa: gpa,
          credits: credits,
          qualityPoints: qp
        });
      }
    });

    if (errors.length > 0) {
      return { success: false, errors };
    }

    let cgpa = 0.00;
    if (totalCredits > 0) {
      const rawCgpa = totalQualityPoints / totalCredits;
      // Only round the final CGPA
      cgpa = Math.round((rawCgpa + Number.EPSILON) * 100) / 100;
    }

    return {
      success: true,
      cgpa,
      totalCredits,
      totalQualityPoints,
      semesterResults
    };
  }
};

if (typeof module !== 'undefined') {
  module.exports = CgpaEngine;
}
