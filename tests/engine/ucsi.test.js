'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const GpaEngine = require('../../src/js/calculator/gpa-engine.js');

const UCSI_DATA_PATH = path.join(__dirname, '..', '..', 'data', 'universities', 'ucsi.json');
const ucsiData = JSON.parse(fs.readFileSync(UCSI_DATA_PATH, 'utf-8'));

// Extract grading scales
const rule2024 = ucsiData.academic_rules.find(r => r.id === 'ucsi_undergrad_2024');
const ruleLegacy = ucsiData.academic_rules.find(r => r.id === 'ucsi_undergrad_legacy');
const SCALE_2024 = rule2024.grading_scales[0];
const SCALE_LEGACY = ruleLegacy.grading_scales[0];

describe('UCSI GPA Engine Specific Tests', () => {
  it('1. Jan 2024 onwards scale calculation', () => {
    const courses = [
      { credits: 3, grade: 'A' },   // 3 * 3.75 = 11.25
      { credits: 3, grade: 'A-' },  // 3 * 3.67 = 11.01
      { credits: 3, grade: 'C+' }   // 3 * 2.50 = 7.50
    ];
    // Total QP = 29.76
    // Credits = 9
    // GPA = 29.76 / 9 = 3.306... -> 3.31
    const result = GpaEngine.calculateGPA(courses, SCALE_2024);
    assert.equal(result.success, true);
    assert.ok(Math.abs(result.totalQualityPoints - 29.76) < 0.0001);
    assert.equal(result.gpa, 3.31);
  });

  it('2. Legacy scale calculation (pre-2024)', () => {
    const courses = [
      { credits: 3, grade: 'A' },   // 3 * 4.00 = 12.00
      { credits: 3, grade: 'A-' },  // 3 * 3.67 = 11.01
      { credits: 3, grade: 'C+' }   // 3 * 2.33 = 6.99
    ];
    // Total QP = 30.00
    // Credits = 9
    // GPA = 30.00 / 9 = 3.333... -> 3.33
    const result = GpaEngine.calculateGPA(courses, SCALE_LEGACY);
    assert.equal(result.success, true);
    assert.ok(Math.abs(result.totalQualityPoints - 30.00) < 0.0001);
    assert.equal(result.gpa, 3.33);
  });
});
