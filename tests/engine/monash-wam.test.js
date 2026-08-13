'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const WamEngine = require('../../src/js/calculator/wam-engine.js');

const DATA_PATH = path.join(__dirname, '..', '..', 'data', 'universities', 'monash-malaysia.json');
const uniData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

const RULE = uniData.academic_rules[0];
const CALC_METHOD = RULE.calculation_methods.primary;
const SCALE = RULE.grading_scales[0];
const EXCLUSIONS = SCALE.grades.filter(g => typeof g.point !== 'number' && typeof g.min_mark !== 'number' && typeof g.max_mark !== 'number' || g.grade === 'WN');

describe('Monash WAM Engine Specific Tests', () => {
  it('1. Simple 6-credit first-year unit', () => {
    const units = [
      { mark: 60, credits: 6, yearLevel: 1 } // 60 * 6 * 0.5 = 180, wCr = 3
    ];
    const result = WamEngine.calculateWAM(units, CALC_METHOD, EXCLUSIONS);
    assert.equal(result.success, true);
    assert.equal(result.totalWeightedMarks, 180);
    assert.equal(result.totalWeightedCredits, 3);
    assert.equal(result.score, 60.000);
  });

  it('2. Simple later-year unit', () => {
    const units = [
      { mark: 60, credits: 6, yearLevel: 2 } // 60 * 6 * 1.0 = 360, wCr = 6
    ];
    const result = WamEngine.calculateWAM(units, CALC_METHOD, EXCLUSIONS);
    assert.equal(result.success, true);
    assert.equal(result.totalWeightedMarks, 360);
    assert.equal(result.totalWeightedCredits, 6);
    assert.equal(result.score, 60.000);
  });

  it('3. First-year weighting', () => {
    const units = [{ mark: 80, credits: 6, yearLevel: 1 }];
    const result = WamEngine.calculateWAM(units, CALC_METHOD, EXCLUSIONS);
    assert.equal(result.totalWeightedMarks, 240);
    assert.equal(result.totalWeightedCredits, 3);
  });

  it('4. Later-year weighting', () => {
    const units = [{ mark: 80, credits: 6, yearLevel: 2 }];
    const result = WamEngine.calculateWAM(units, CALC_METHOD, EXCLUSIONS);
    assert.equal(result.totalWeightedMarks, 480);
    assert.equal(result.totalWeightedCredits, 6);
  });

  it('5. Mixed-year calculation', () => {
    const units = [
      { mark: 80, credits: 6, yearLevel: 1 }, // wMark: 240, wCr: 3
      { mark: 70, credits: 6, yearLevel: 2 }  // wMark: 420, wCr: 6
    ];
    // Total wMark: 660, Total wCr: 9
    // WAM: 660 / 9 = 73.333
    const result = WamEngine.calculateWAM(units, CALC_METHOD, EXCLUSIONS);
    assert.equal(result.success, true);
    assert.equal(result.totalWeightedMarks, 660);
    assert.equal(result.totalWeightedCredits, 9);
    assert.equal(result.score, 73.333);
  });

  it('6. Official Monash example', () => {
    const units = [
      { name: "MON1001", mark: 63, credits: 6, yearLevel: 1 },   // 63 * 6 * 0.5 = 189
      { name: "MON1002", mark: 80, credits: 12, yearLevel: 1 },  // 80 * 12 * 0.5 = 480
      { name: "MON1003", mark: 40, credits: 6, yearLevel: 1 },   // 40 * 6 * 0.5 = 120
      { name: "MON1004", mark: 85, credits: 6, yearLevel: 1 },   // 85 * 6 * 0.5 = 255
      { name: "MON2001", mark: 96, credits: 24, yearLevel: 2 },  // 96 * 24 * 1.0 = 2304
      { name: "MON2002", mark: null, specialResult: "WN", credits: 6, yearLevel: 2 }, // 0 * 6 * 1.0 = 0
      { name: "MON3001", mark: 65, credits: 6, yearLevel: 3 },   // 65 * 6 * 1.0 = 390
      { name: "MON3002", mark: 77, credits: 6, yearLevel: 3 },   // 77 * 6 * 1.0 = 462
      { name: "MON4001", mark: 82, credits: 6, yearLevel: 4 }    // 82 * 6 * 1.0 = 492
    ];
    // Expected WAM: 74.476
    const result = WamEngine.calculateWAM(units, CALC_METHOD, EXCLUSIONS);
    assert.equal(result.success, true);
    assert.equal(result.score, 74.476);
  });

  it('7. Excluded grades must not affect WAM', () => {
    const units = [
      { mark: 80, credits: 6, yearLevel: 2 }, // Included
      { specialResult: "SFR", credits: 6, yearLevel: 2 },
      { specialResult: "NSR", credits: 6, yearLevel: 2 },
      { specialResult: "NE", credits: 6, yearLevel: 2 },
      { specialResult: "NAS", credits: 6, yearLevel: 2 },
      { specialResult: "WDN", credits: 6, yearLevel: 2 },
      { specialResult: "WI", credits: 6, yearLevel: 2 },
      { specialResult: "PGO", credits: 6, yearLevel: 2 },
      { specialResult: "NGO", credits: 6, yearLevel: 2 },
      { specialResult: "DEF", credits: 6, yearLevel: 2 },
      { specialResult: "NS", credits: 6, yearLevel: 2 },
      { specialResult: "WH", credits: 6, yearLevel: 2 }
    ];
    const result = WamEngine.calculateWAM(units, CALC_METHOD, EXCLUSIONS);
    assert.equal(result.success, true);
    assert.equal(result.score, 80.000); // Excluded units don't affect WAM
    assert.equal(result.excludedCount, 11);
    assert.equal(result.includedCount, 1);
  });

  it('8. WN must affect WAM as zero', () => {
    const units = [
      { mark: 80, credits: 6, yearLevel: 2 }, // 480 wMark, 6 wCr
      { specialResult: "WN", credits: 6, yearLevel: 2 } // 0 wMark, 6 wCr
    ];
    // WAM = 480 / 12 = 40.000
    const result = WamEngine.calculateWAM(units, CALC_METHOD, EXCLUSIONS);
    assert.equal(result.success, true);
    assert.equal(result.score, 40.000);
  });

  it('9. Failed numeric marks affect WAM', () => {
    const units = [
      { mark: 80, credits: 6, yearLevel: 2 }, // 480
      { mark: 40, credits: 6, yearLevel: 2 }  // 240
    ];
    // WAM = 720 / 12 = 60.000
    const result = WamEngine.calculateWAM(units, CALC_METHOD, EXCLUSIONS);
    assert.equal(result.success, true);
    assert.equal(result.score, 60.000);
  });

  it('10. Repeated units are both included', () => {
    // Monash policy: both attempts count. The engine natively supports this by calculating all given units.
    const units = [
      { mark: 45, credits: 6, yearLevel: 2 }, // Attempt 1 (Fail)
      { mark: 68, credits: 6, yearLevel: 2 }  // Attempt 2 (Pass)
    ];
    // WAM = (270 + 408) / 12 = 678 / 12 = 56.500
    const result = WamEngine.calculateWAM(units, CALC_METHOD, EXCLUSIONS);
    assert.equal(result.success, true);
    assert.equal(result.score, 56.500);
  });

  it('11. Final rounding to exactly 3 decimal places', () => {
    const units = [
      { mark: 66, credits: 6, yearLevel: 2 }, // 396
      { mark: 67, credits: 6, yearLevel: 2 }, // 402
      { mark: 68, credits: 6, yearLevel: 2 }  // 408
    ];
    // 1206 / 18 = 67.000
    // To test rounding explicitly:
    const units2 = [
      { mark: 85, credits: 6, yearLevel: 2 }, // 510
      { mark: 72, credits: 6, yearLevel: 2 }, // 432
      { mark: 58, credits: 6, yearLevel: 2 }  // 348
    ];
    // 1290 / 18 = 71.666666...
    const result2 = WamEngine.calculateWAM(units2, CALC_METHOD, EXCLUSIONS);
    assert.equal(result2.success, true);
    assert.equal(result2.score, 71.667);
  });

  it('12. Floating-point precision', () => {
    // E.g., numbers that often cause float issues in JS
    const units = [
      { mark: 0.1, credits: 1, yearLevel: 1 },
      { mark: 0.2, credits: 1, yearLevel: 1 }
    ];
    const result = WamEngine.calculateWAM(units, CALC_METHOD, EXCLUSIONS);
    assert.equal(result.success, true);
    assert.equal(result.score, 0.150); // Exact float validation
  });
});
