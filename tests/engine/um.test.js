'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const GpaEngine = require('../../src/js/calculator/gpa-engine.js');

const UM_DATA_PATH = path.join(__dirname, '..', '..', 'data', 'universities', 'um.json');
const umData = JSON.parse(fs.readFileSync(UM_DATA_PATH, 'utf-8'));

const ruleCurrent = umData.academic_rules.find(r => r.id === 'um_undergrad_current');
const SCALE = ruleCurrent.grading_scales[0];

describe('Universiti Malaya (UM) GPA Engine Specific Tests', () => {
  it('1. Standard calculation handling the 3.70 / 3.30 variance', () => {
    const courses = [
      { credits: 3, grade: 'A-' },  // 3 * 3.70 = 11.10
      { credits: 3, grade: 'B+' },  // 3 * 3.30 = 9.90
      { credits: 4, grade: 'B-' }   // 4 * 2.70 = 10.80
    ];
    // Total QP = 31.80
    // Credits = 10
    // GPA = 31.80 / 10 = 3.18
    const result = GpaEngine.calculateGPA(courses, SCALE);
    assert.equal(result.success, true);
    assert.ok(Math.abs(result.totalQualityPoints - 31.80) < 0.0001);
    assert.equal(result.gpa, 3.18);
  });

  it('2. F is counted mathematically as 0.00 points but adds credits', () => {
    const courses = [
      { credits: 3, grade: 'C' },   // 3 * 2.00 = 6.00
      { credits: 3, grade: 'F' }    // 3 * 0.00 = 0.00 (counts to divisor)
    ];
    // Total QP = 6.00
    // Credits = 6
    // GPA = 6.00 / 6 = 1.00
    const result = GpaEngine.calculateGPA(courses, SCALE);
    assert.equal(result.success, true);
    assert.equal(result.totalCredits, 6);
    assert.equal(result.gpa, 1.00);
  });
});
