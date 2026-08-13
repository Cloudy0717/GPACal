'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const GpaEngine = require('../../src/js/calculator/gpa-engine.js');

const UTAR_DATA_PATH = path.join(__dirname, '..', '..', 'data', 'universities', 'utar.json');
const UTAR_CONFIG = JSON.parse(fs.readFileSync(UTAR_DATA_PATH, 'utf-8')).academic_rules[0].grading_scales[0];

describe('GPA Engine', () => {
  it('1. Normal calculation with mixed grades', () => {
    const courses = [
      { credits: 3, grade: 'A' },
      { credits: 4, grade: 'B+' },
      { credits: 2, grade: 'C' }
    ];
    const result = GpaEngine.calculateGPA(courses, UTAR_CONFIG);
    assert.equal(result.success, true);
    assert.equal(result.totalCredits, 9);
    // 3*4.0 + 4*3.33 + 2*2.0 = 12 + 13.32 + 4.0 = 29.32
    // GPA = 29.32 / 9 = 3.257777... -> 3.26
    assert.equal(result.gpa, 3.26);
    assert.equal(result.totalQualityPoints, 29.32);
  });

  it('2. Multiple courses with the exact same final rounding output (verify NO intermediate rounding)', () => {
    const courses = [
      { credits: 3, grade: 'A-' }, // 3 * 3.67 = 11.01
      { credits: 3, grade: 'B-' }, // 3 * 2.67 = 8.01
      { credits: 4, grade: 'A' }   // 4 * 4.0 = 16.00
    ];
    // Total QP = 35.02. Credits = 10.
    // 35.02 / 10 = 3.502 -> 3.50
    const result = GpaEngine.calculateGPA(courses, UTAR_CONFIG);
    assert.equal(result.success, true);
    assert.ok(Math.abs(result.totalQualityPoints - 35.02) < 0.0001);
    assert.equal(result.gpa, 3.50);
  });

  it('3. Pass/Fail grade exclusion', () => {
    const courses = [
      { credits: 3, grade: 'A' },
      { credits: 6, grade: 'P' },  // Excluded from divisor
      { credits: 4, grade: 'PS' }  // Excluded from divisor
    ];
    const result = GpaEngine.calculateGPA(courses, UTAR_CONFIG);
    assert.equal(result.success, true);
    assert.equal(result.totalCredits, 3);
    assert.equal(result.totalQualityPoints, 12);
    assert.equal(result.gpa, 4.00);
    assert.equal(result.courseResults[1].includedInGPA, false);
    assert.equal(result.courseResults[2].includedInGPA, false);
  });

  it('4. Validation: Empty course list', () => {
    const result = GpaEngine.calculateGPA([], UTAR_CONFIG);
    assert.equal(result.success, false);
    assert.ok(result.errors.includes('No courses provided.'));
  });

  it('5. Validation: Zero credits', () => {
    const courses = [{ credits: 0, grade: 'A' }];
    const result = GpaEngine.calculateGPA(courses, UTAR_CONFIG);
    assert.equal(result.success, false);
    assert.ok(result.errors[0].includes('Credits cannot be zero.'));
  });

  it('6. Validation: Negative credits', () => {
    const courses = [{ credits: -3, grade: 'A' }];
    const result = GpaEngine.calculateGPA(courses, UTAR_CONFIG);
    assert.equal(result.success, false);
    assert.ok(result.errors[0].includes('Credits must be a positive number.'));
  });

  it('7. Validation: Invalid grade', () => {
    const courses = [{ credits: 3, grade: 'XYZ' }];
    const result = GpaEngine.calculateGPA(courses, UTAR_CONFIG);
    assert.equal(result.success, false);
    assert.ok(result.errors[0].includes("Input 'XYZ' could not be resolved"));
  });

  it('8. Validation: Missing grade', () => {
    const courses = [{ credits: 3, grade: '' }];
    const result = GpaEngine.calculateGPA(courses, UTAR_CONFIG);
    assert.equal(result.success, false);
    assert.ok(result.errors[0].includes('Missing or invalid grade.'));
  });

  it('9. Validation: Non-numeric credits', () => {
    const courses = [{ credits: "abc", grade: 'A' }];
    const result = GpaEngine.calculateGPA(courses, UTAR_CONFIG);
    assert.equal(result.success, false);
    assert.ok(result.errors[0].includes('Credits must be a positive number.'));
  });

  it('10. Validation: Malformed grading config', () => {
    const courses = [{ credits: 3, grade: 'A' }];
    const result = GpaEngine.calculateGPA(courses, {});
    assert.equal(result.success, false);
    assert.ok(result.errors.includes('Invalid grading configuration.'));
  });

  it('11. All courses are pass/fail', () => {
    const courses = [
      { credits: 3, grade: 'P' },
      { credits: 4, grade: 'PS' }
    ];
    const result = GpaEngine.calculateGPA(courses, UTAR_CONFIG);
    assert.equal(result.success, true);
    assert.equal(result.totalCredits, 0);
    assert.equal(result.totalQualityPoints, 0);
    assert.equal(result.gpa, 0.00); // Handled safely
  });

  it('12. UTAR Manual Example Check', () => {
    const courses = [
      { name: 'Programming', credits: 3, grade: 'A' },   // 3 * 4.0 = 12
      { name: 'Database', credits: 3, grade: 'A-' },     // 3 * 3.67 = 11.01
      { name: 'Statistics', credits: 3, grade: 'B+' },   // 3 * 3.33 = 9.99
      { name: 'English', credits: 2, grade: 'A' }        // 2 * 4.0 = 8.0
    ];
    const result = GpaEngine.calculateGPA(courses, UTAR_CONFIG);
    assert.equal(result.success, true);
    assert.equal(result.totalCredits, 11);
    
    // QP: 12 + 11.01 + 9.99 + 8.0 = 41.00
    // GPA: 41.00 / 11 = 3.7272... -> 3.73
    assert.equal(result.totalQualityPoints, 41.00);
    assert.equal(result.gpa, 3.73);
  });
});

