'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const GpaEngine = require('../../src/js/calculator/gpa-engine.js');

const DATA_PATH = path.join(__dirname, '..', '..', 'data', 'universities', 'uow-malaysia.json');
const uowData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

const ruleCurrent = uowData.academic_rules.find(r => r.id === 'uow_malaysia_undergrad_current');
const SCALE = ruleCurrent.grading_scales[0];

describe('UOW Malaysia KDU GPA Engine Specific Tests', () => {
  it('1. A+ = 4.00, A- = 3.67, and weighted calculations', () => {
    const courses = [
      { credits: 3, grade: 'A+' },  // 3 * 4.00 = 12.00
      { credits: 4, grade: 'A-' },  // 4 * 3.67 = 14.68
      { credits: 2, grade: 'B' }    // 2 * 3.00 = 6.00
    ];
    // Total QP = 12.00 + 14.68 + 6.00 = 32.68
    // Credits = 9
    // GPA = 32.68 / 9 = 3.63111...
    const result = GpaEngine.calculateGPA(courses, SCALE);
    assert.equal(result.success, true);
    assert.ok(Math.abs(result.totalQualityPoints - 32.68) < 0.0001);
    assert.equal(Number(result.gpa.toFixed(2)), 3.63);
  });

  it('2. Pass/Fail (P) exclusion', () => {
    const courses = [
      { credits: 3, grade: 'B+' },  // 3 * 3.33 = 9.99
      { credits: 3, grade: 'P' }    // excluded
    ];
    const result = GpaEngine.calculateGPA(courses, SCALE);
    assert.equal(result.success, true);
    assert.equal(result.totalCredits, 3);
    assert.ok(Math.abs(result.totalQualityPoints - 9.99) < 0.0001);
    assert.equal(result.gpa, 3.33);
  });

  it('3. Normal F = 0.00 behavior (counts credits)', () => {
    const courses = [
      { credits: 3, grade: 'C+' },  // 3 * 2.33 = 6.99
      { credits: 4, grade: 'F' }    // 4 * 0.00 = 0.00, counts to credits
    ];
    // Total QP = 6.99
    // Credits = 7
    // GPA = 6.99 / 7 = 0.998...
    const result = GpaEngine.calculateGPA(courses, SCALE);
    assert.equal(result.success, true);
    assert.equal(result.totalCredits, 7);
    assert.equal(Number(result.gpa.toFixed(2)), 1.00);
  });

  it('4. W exclusion', () => {
    const courses = [
      { credits: 3, grade: 'B-' },  // 3 * 2.67 = 8.01
      { credits: 4, grade: 'W' }    // excluded
    ];
    const result = GpaEngine.calculateGPA(courses, SCALE);
    assert.equal(result.success, true);
    assert.equal(result.totalCredits, 3);
    assert.equal(result.gpa, 2.67);
  });

  it('5. Check repeat_policy configuration', () => {
    assert.equal(ruleCurrent.repeat_policy.supported, true);
    assert.equal(ruleCurrent.repeat_policy.implemented, false);
  });
});
