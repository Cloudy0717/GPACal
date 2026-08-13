'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const CgpaEngine = require('../../src/js/calculator/cgpa-engine.js');

describe('CGPA Engine', () => {
  it('1. Normal multi-semester (3 semesters)', () => {
    const semesters = [
      { gpa: 3.50, credits: 18 },
      { gpa: 3.80, credits: 20 },
      { gpa: 3.60, credits: 18 }
    ];
    const result = CgpaEngine.calculateCGPA(semesters);
    assert.equal(result.success, true);
    assert.equal(result.totalCredits, 56);
    // QP: 18*3.5 = 63, 20*3.8 = 76, 18*3.6 = 64.8
    // Total QP: 203.8
    // CGPA: 203.8 / 56 = 3.63928... -> 3.64
    assert.equal(result.totalQualityPoints, 203.8);
    assert.equal(result.cgpa, 3.64);
  });

  it('2. Unequal semester credit loads without intermediate rounding', () => {
    const semesters = [
      { gpa: 3.67, credits: 17 }, // 17 * 3.67 = 62.39
      { gpa: 2.33, credits: 3 }   // 3 * 2.33 = 6.99
    ];
    // Total QP = 69.38
    // Total Cr = 20
    // CGPA = 69.38 / 20 = 3.469 -> 3.47
    const result = CgpaEngine.calculateCGPA(semesters);
    assert.equal(result.success, true);
    assert.ok(Math.abs(result.totalQualityPoints - 69.38) < 0.0001);
    assert.equal(result.cgpa, 3.47);
  });

  it('3. Validation: Empty array', () => {
    const result = CgpaEngine.calculateCGPA([]);
    assert.equal(result.success, false);
    assert.ok(result.errors.includes('No semesters provided.'));
  });

  it('4. Validation: Invalid GPA', () => {
    const semesters = [{ gpa: 'XYZ', credits: 18 }];
    const result = CgpaEngine.calculateCGPA(semesters);
    assert.equal(result.success, false);
    assert.ok(result.errors[0].includes('GPA must be a positive number.'));
  });

  it('5. Validation: Negative Credits', () => {
    const semesters = [{ gpa: 3.50, credits: -5 }];
    const result = CgpaEngine.calculateCGPA(semesters);
    assert.equal(result.success, false);
    assert.ok(result.errors[0].includes('Credits must be a positive number greater than zero.'));
  });

  it('6. Validation: Zero Credits', () => {
    const semesters = [{ gpa: 3.50, credits: 0 }];
    const result = CgpaEngine.calculateCGPA(semesters);
    assert.equal(result.success, false);
    assert.ok(result.errors[0].includes('Credits must be a positive number greater than zero.'));
  });
  
  it('7. Validation: Negative GPA', () => {
    const semesters = [{ gpa: -1.0, credits: 15 }];
    const result = CgpaEngine.calculateCGPA(semesters);
    assert.equal(result.success, false);
    assert.ok(result.errors[0].includes('GPA must be a positive number.'));
  });

  it('8. All 0.00 GPA valid output', () => {
    const semesters = [{ gpa: 0.00, credits: 15 }];
    const result = CgpaEngine.calculateCGPA(semesters);
    assert.equal(result.success, true);
    assert.equal(result.totalCredits, 15);
    assert.equal(result.totalQualityPoints, 0);
    assert.equal(result.cgpa, 0.00);
  });
});
