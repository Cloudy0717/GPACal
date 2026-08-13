'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const Loader = require('../../src/js/university/loader.js');

const DATA_DIR = path.join(__dirname, '..', '..', 'data', 'universities');
const ucsiData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'ucsi.json'), 'utf-8'));

describe('Academic Rule Resolver', () => {
  it('1. Resolves to the legacy pre-2024 rule for a 2023 intake date', () => {
    const rule = Loader.resolveAcademicRule(ucsiData, { intakeDate: '2023-08-01' });
    assert.ok(rule);
    assert.equal(rule.id, 'ucsi_undergrad_legacy');
    
    // Ensure the scale behaves legally (A = 4.00)
    const scale = Loader.getGradingScale(rule);
    const aGrade = scale.grades.find(g => g.grade === 'A');
    assert.equal(aGrade.point, 4.00);
  });

  it('2. Resolves to the new 2024+ rule for a Jan 2024 intake date', () => {
    const rule = Loader.resolveAcademicRule(ucsiData, { intakeDate: '2024-01-01' });
    assert.ok(rule);
    assert.equal(rule.id, 'ucsi_undergrad_2024');
    
    // Ensure the scale behaves natively for 2024 (A = 3.75)
    const scale = Loader.getGradingScale(rule);
    const aGrade = scale.grades.find(g => g.grade === 'A');
    assert.equal(aGrade.point, 3.75);
  });

  it('3. Resolves to the new 2024+ rule for a 2025 intake date', () => {
    const rule = Loader.resolveAcademicRule(ucsiData, { intakeDate: '2025-05-15' });
    assert.ok(rule);
    assert.equal(rule.id, 'ucsi_undergrad_2024');
  });

  it('4. Falls back to the first available rule if no constraints provided (MVP behavior)', () => {
    const rule = Loader.resolveAcademicRule(ucsiData, {});
    assert.ok(rule);
    // As defined in JSON, ucsi_undergrad_2024 is listed first
    assert.equal(rule.id, 'ucsi_undergrad_2024');
  });

  it('5. Returns null if intake date is wildly out of bounds (assuming bounds are restrictive)', () => {
    // If the data was artificially bounded (e.g. 2010 to 2015), it should return null.
    // We can simulate this with a mock university object.
    const mockUni = {
      academic_rules: [
        { id: "mock_rule", effective_from: "2010-01-01", effective_to: "2015-12-31" }
      ]
    };
    const rule = Loader.resolveAcademicRule(mockUni, { intakeDate: '2020-01-01' });
    assert.equal(rule, null);
  });
});
