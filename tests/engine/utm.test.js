'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const GpaEngine = require('../../src/js/calculator/gpa-engine.js');

const UTM_DATA_PATH = path.join(__dirname, '..', '..', 'data', 'universities', 'utm.json');
const utmData = JSON.parse(fs.readFileSync(UTM_DATA_PATH, 'utf-8'));

const ruleCurrent = utmData.academic_rules.find(r => r.id === 'utm_undergrad_2022');
const SCALE = ruleCurrent.grading_scales[0];

describe('Universiti Teknologi Malaysia (UTM) GPA Engine Tests', () => {
  it('1. Grade point mappings (A+ = 4.00, A = 4.00, A- = 3.67, E = 0.00)', () => {
    const courses = [
      { credits: 3, grade: 'A+' },
      { credits: 3, grade: 'A' },
      { credits: 3, grade: 'A-' },
      { credits: 3, grade: 'E' }
    ];
    
    // Total QP = (4.00*3) + (4.00*3) + (3.67*3) + (0.00*3) = 12 + 12 + 11.01 + 0 = 35.01
    // Total Credits = 12
    // GPA = 35.01 / 12 = 2.9175 => 2.92
    
    const result = GpaEngine.calculateGPA(courses, SCALE);
    assert.equal(result.success, true);
    assert.equal(result.totalCredits, 12);
    assert.ok(Math.abs(result.totalQualityPoints - 35.01) < 0.0001);
    assert.equal(result.gpa, 2.92);
  });

  it('2. Weighted GPA calculation', () => {
    const courses = [
      { credits: 4, grade: 'B+' }, // 3.33 * 4 = 13.32
      { credits: 2, grade: 'C+' }  // 2.33 * 2 = 4.66
    ];
    // Total QP = 17.98
    // Total Credits = 6
    // GPA = 17.98 / 6 = 2.9966... => 3.00
    
    const result = GpaEngine.calculateGPA(courses, SCALE);
    assert.equal(result.success, true);
    assert.equal(result.totalCredits, 6);
    assert.ok(Math.abs(result.totalQualityPoints - 17.98) < 0.0001);
    assert.equal(result.gpa, 3.00);
  });

  it('3. Non-point grade exclusion (HS, HL, HG, TS)', () => {
    const courses = [
      { credits: 3, grade: 'A' },
      { credits: 2, grade: 'HS' },
      { credits: 3, grade: 'HL' },
      { credits: 4, grade: 'HG' },
      { credits: 2, grade: 'TS' }
    ];
    
    const result = GpaEngine.calculateGPA(courses, SCALE);
    assert.equal(result.success, true);
    assert.equal(result.totalCredits, 3);
    assert.equal(result.totalQualityPoints, 12.00);
    assert.equal(result.gpa, 4.00);
  });

  it('4. Verify repeat_policy.implemented === false metadata flag exists', () => {
    assert.equal(ruleCurrent.repeat_policy.implemented, false);
  });

  it('5. CGPA calculation (Cumulative across semesters)', () => {
    // UTM CGPA uses the same point calculation methodology over cumulative courses
    const semester1 = [
      { credits: 3, grade: 'B' },  // 3.00 * 3 = 9.00
      { credits: 2, grade: 'A-' }  // 3.67 * 2 = 7.34
    ];
    const semester2 = [
      { credits: 4, grade: 'C' },  // 2.00 * 4 = 8.00
      { credits: 3, grade: 'A' }   // 4.00 * 3 = 12.00
    ];
    
    // Combining semesters to simulate CGPA calculation
    const cumulativeCourses = [...semester1, ...semester2];
    
    // Total QP = 9.00 + 7.34 + 8.00 + 12.00 = 36.34
    // Total Credits = 12
    // CGPA = 36.34 / 12 = 3.0283... => 3.03
    
    const result = GpaEngine.calculateGPA(cumulativeCourses, SCALE);
    assert.equal(result.success, true);
    assert.equal(result.totalCredits, 12);
    assert.ok(Math.abs(result.totalQualityPoints - 36.34) < 0.0001);
    assert.equal(result.gpa, 3.03); // The computed GPA value here acts as the CGPA
  });
});
