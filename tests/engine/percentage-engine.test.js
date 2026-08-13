'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const GpaEngine = require('../../src/js/calculator/gpa-engine.js');

const MARK_GRADING_SCALE = {
  id: 'standard_marks',
  input_type: 'mark',
  grades: [
    { grade: 'HD', min_mark: 80, max_mark: 100, point: 4.00, counts: { gpa: true, cgpa: true, credits: true } },
    { grade: 'D',  min_mark: 70, max_mark: 79.99, point: 3.00, counts: { gpa: true, cgpa: true, credits: true } },
    { grade: 'C',  min_mark: 60, max_mark: 69.99, point: 2.00, counts: { gpa: true, cgpa: true, credits: true } },
    { grade: 'P',  min_mark: 50, max_mark: 59.99, point: 1.00, counts: { gpa: true, cgpa: true, credits: true } },
    { grade: 'N',  min_mark: 0,  max_mark: 49.99, point: 0.00, counts: { gpa: true, cgpa: true, credits: true } },
    { grade: 'W',  min_mark: null, max_mark: null, point: null, counts: { gpa: false, cgpa: false, credits: false } }
  ]
};

const CALC_METHOD_WAM = {
  method: 'weighted_mark_average',
  display: {
    label: 'WAM',
    format: 'percentage'
  }
};

describe('Generic Percentage/Mark Engine Abstraction', () => {
  it('1. mark-based grade resolution works when min/max boundaries are present', () => {
    const courses = [
      { credits: 3, grade: 85 }, // resolves to HD (4.00)
      { credits: 3, grade: 75 }, // resolves to D (3.00)
      { credits: 4, grade: 55 }  // resolves to P (1.00)
    ];
    // QP: 12 + 9 + 4 = 25
    // GPA: 25 / 10 = 2.50
    const result = GpaEngine.calculateGPA(courses, MARK_GRADING_SCALE, CALC_METHOD_WAM);
    assert.equal(result.success, true);
    assert.equal(result.gpa, 2.50);
    assert.equal(result.resultLabel, 'WAM');
    assert.equal(result.resultFormat, 'percentage');
  });

  it('2. boundary marks resolve correctly', () => {
    const courses = [
      { credits: 3, grade: 79.99 }, // Should be D (3.00), right on boundary
      { credits: 3, grade: 80 }     // Should be HD (4.00), exact boundary start
    ];
    const result = GpaEngine.calculateGPA(courses, MARK_GRADING_SCALE);
    assert.equal(result.success, true);
    assert.equal(result.courseResults[0].point, 3.00);
    assert.equal(result.courseResults[1].point, 4.00);
  });

  it('3. overlapping or invalid mark ranges are rejected', () => {
    const courses = [
      { credits: 3, grade: 105 }, // Out of bounds
      { credits: 3, grade: -5 },  // Out of bounds
      { credits: 3, grade: 'HD' } // String input on a 'mark' scale should fail bucket resolution gracefully
    ];
    const result = GpaEngine.calculateGPA(courses, MARK_GRADING_SCALE);
    assert.equal(result.success, false);
    assert.equal(result.errors.length, 3);
    assert.ok(result.errors[0].includes('Input \'105\' could not be resolved'));
    assert.ok(result.errors[1].includes('Input \'-5\' could not be resolved'));
    assert.ok(result.errors[2].includes('Input \'HD\' could not be resolved'));
  });

  it('4. mark resolution does not modify existing GPA mathematics', () => {
    const courses = [
      { credits: 3, grade: 100 }, // 4.00
      { credits: 3, grade: 0 }    // 0.00
    ];
    const result = GpaEngine.calculateGPA(courses, MARK_GRADING_SCALE);
    assert.equal(result.success, true);
    assert.equal(result.totalCredits, 6);
    assert.equal(result.totalQualityPoints, 12);
    assert.equal(result.gpa, 2.00);
  });
});
