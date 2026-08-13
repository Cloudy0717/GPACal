'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const GpaEngine = require('../../src/js/calculator/gpa-engine.js');

const HELP_DATA_PATH = path.join(__dirname, '..', '..', 'data', 'universities', 'help.json');
const helpData = JSON.parse(fs.readFileSync(HELP_DATA_PATH, 'utf-8'));

const ruleCurrent = helpData.academic_rules.find(r => r.id === 'help_undergrad_2024');
const SCALE = ruleCurrent.grading_scales[0];

describe('HELP GPA Engine Specific Tests', () => {
  it('1. Standard calculation', () => {
    const courses = [
      { credits: 3, grade: 'A' },   // 3 * 3.75 = 11.25
      { credits: 3, grade: 'C+' },  // 3 * 2.50 = 7.50
      { credits: 4, grade: 'B' }    // 4 * 3.00 = 12.00
    ];
    // Total QP = 30.75
    // Credits = 10
    // GPA = 30.75 / 10 = 3.075 -> 3.08
    const result = GpaEngine.calculateGPA(courses, SCALE);
    assert.equal(result.success, true);
    assert.ok(Math.abs(result.totalQualityPoints - 30.75) < 0.0001);
    assert.equal(result.gpa, 3.08);
  });

  it('2. F is counted mathematically as 0.00 points but adds credits', () => {
    const courses = [
      { credits: 3, grade: 'A-' },   // 3 * 3.50 = 10.50
      { credits: 3, grade: 'F' }     // 3 * 0.00 = 0.00 (counts to divisor)
    ];
    // Total QP = 10.50
    // Credits = 6
    // GPA = 10.50 / 6 = 1.75
    const result = GpaEngine.calculateGPA(courses, SCALE);
    assert.equal(result.success, true);
    assert.equal(result.totalCredits, 6);
    assert.equal(result.gpa, 1.75);
  });

  it('3. AW and temporary grades are completely excluded from GPA divisor', () => {
    const courses = [
      { credits: 3, grade: 'B+' },   // 3 * 3.25 = 9.75
      { credits: 3, grade: 'AW' },   // excluded entirely
      { credits: 4, grade: 'IP' },   // excluded entirely
      { credits: 2, grade: 'RC' }    // excluded entirely
    ];
    // Total QP = 9.75
    // Credits = 3
    // GPA = 9.75 / 3 = 3.25
    const result = GpaEngine.calculateGPA(courses, SCALE);
    assert.equal(result.success, true);
    assert.equal(result.totalCredits, 3);
    assert.equal(result.gpa, 3.25);
  });
});
