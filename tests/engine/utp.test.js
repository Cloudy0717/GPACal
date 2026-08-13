'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');

const GpaEngine = require('../../src/js/calculator/gpa-engine.js');
const CgpaEngine = require('../../src/js/calculator/cgpa-engine.js');

const UTP_DATA_PATH = path.join(__dirname, '..', '..', 'data', 'universities', 'utp.json');
const utpData = JSON.parse(fs.readFileSync(UTP_DATA_PATH, 'utf-8'));

const ruleCurrent = utpData.academic_rules.find(r => r.id === 'utp_undergrad_current');
const SCALE = ruleCurrent.grading_scales[0];

describe('Universiti Teknologi PETRONAS (UTP) GPA Engine Tests', () => {
  it('1. A = 4.00, A- = 3.75, B+ = 3.50 (weighted GPA calculation)', () => {
    const courses = [
      { credits: 3, grade: 'A' },  // 3 * 4.00 = 12.00
      { credits: 3, grade: 'A-' }, // 3 * 3.75 = 11.25
      { credits: 4, grade: 'B+' }  // 4 * 3.50 = 14.00
    ];
    // Total QP = 37.25
    // Total Credits = 10
    // GPA = 37.25 / 10 = 3.725 -> 3.73
    const result = GpaEngine.calculateGPA(courses, SCALE);
    assert.equal(result.success, true);
    assert.ok(Math.abs(result.totalQualityPoints - 37.25) < 0.0001);
    assert.equal(result.gpa, 3.73);
  });

  it('2. F/QF = 0.00 behavior (counts credits but gives 0 points)', () => {
    const courses = [
      { credits: 3, grade: 'A' },  // 3 * 4.00 = 12.00
      { credits: 3, grade: 'F' },  // 3 * 0.00 = 0.00
      { credits: 2, grade: 'QF' }  // 2 * 0.00 = 0.00
    ];
    // Total QP = 12.00
    // Total Credits = 8
    // GPA = 12.00 / 8 = 1.50
    const result = GpaEngine.calculateGPA(courses, SCALE);
    assert.equal(result.success, true);
    assert.equal(result.totalCredits, 8);
    assert.equal(result.gpa, 1.50);
  });

  it('3. AU (Audit) exclusion (does not count for GPA)', () => {
    const courses = [
      { credits: 3, grade: 'A' },  // 12.00
      { credits: 3, grade: 'AU' }  // 0.00, 0 credits
    ];
    const result = GpaEngine.calculateGPA(courses, SCALE);
    assert.equal(result.success, true);
    assert.equal(result.totalCredits, 3);
    assert.equal(result.gpa, 4.00);
  });

  it('4. CGPA calculation across semesters', () => {
    const semesters = [
      { gpa: 3.73, credits: 10 },
      { gpa: 1.50, credits: 8 },
      { gpa: 4.00, credits: 3 }
    ];
    // QP: 10*3.73=37.3, 8*1.50=12.0, 3*4.00=12.0. Total QP=61.3. Credits=21. CGPA=61.3/21 = 2.919 -> 2.92
    const result = CgpaEngine.calculateCGPA(semesters);
    assert.equal(result.success, true);
    assert.equal(result.totalCredits, 21);
    assert.equal(result.cgpa, 2.92);
  });

  it('5. Verify repeat_policy.implemented === false metadata flag exists', () => {
    assert.equal(ruleCurrent.repeat_policy.implemented, false);
  });
});
