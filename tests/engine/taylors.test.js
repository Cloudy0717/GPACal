'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const GpaEngine = require('../../src/js/calculator/gpa-engine.js');

const TAYLORS_DATA_PATH = path.join(__dirname, '..', '..', 'data', 'universities', 'taylors.json');
const taylorsData = JSON.parse(fs.readFileSync(TAYLORS_DATA_PATH, 'utf-8'));

// Extract grading scales
const ruleCurrent = taylorsData.academic_rules.find(r => r.id === 'taylors_undergrad_current');
const SCALE = ruleCurrent.grading_scales[0];

describe('Taylor\'s GPA Engine Specific Tests', () => {
  it('1. Standard calculation', () => {
    const courses = [
      { credits: 3, grade: 'A' },   // 3 * 4.00 = 12.00
      { credits: 3, grade: 'C+' },  // 3 * 2.33 = 6.99
      { credits: 4, grade: 'D' }    // 4 * 1.33 = 5.32
    ];
    // Total QP = 24.31
    // Credits = 10
    // GPA = 24.31 / 10 = 2.431 -> 2.43
    const result = GpaEngine.calculateGPA(courses, SCALE);
    assert.equal(result.success, true);
    assert.ok(Math.abs(result.totalQualityPoints - 24.31) < 0.0001);
    assert.equal(result.gpa, 2.43);
  });

  it('2. F(W) is counted mathematically as F', () => {
    const courses = [
      { credits: 3, grade: 'B' },    // 3 * 3.00 = 9.00
      { credits: 3, grade: 'F(W)' }  // 3 * 0.00 = 0.00 (counts to divisor)
    ];
    // Total QP = 9.00
    // Credits = 6
    // GPA = 9.00 / 6 = 1.50
    const result = GpaEngine.calculateGPA(courses, SCALE);
    assert.equal(result.success, true);
    assert.equal(result.totalCredits, 6);
    assert.equal(result.gpa, 1.50);
  });

  it('3. WD is completely excluded from GPA divisor', () => {
    const courses = [
      { credits: 3, grade: 'B' },    // 3 * 3.00 = 9.00
      { credits: 3, grade: 'WD' }    // excluded entirely
    ];
    // Total QP = 9.00
    // Credits = 3
    // GPA = 9.00 / 3 = 3.00
    const result = GpaEngine.calculateGPA(courses, SCALE);
    assert.equal(result.success, true);
    assert.equal(result.totalCredits, 3);
    assert.equal(result.gpa, 3.00);
  });
});
