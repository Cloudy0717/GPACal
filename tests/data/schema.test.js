'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const UNI_DIR = path.join(DATA_DIR, 'universities');

// ---------------------------------------------------------------------------
// Registry validation
// ---------------------------------------------------------------------------

describe('universities.json registry', () => {
  const registry = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'universities.json'), 'utf-8'));

  it('has schema_version', () => {
    assert.equal(typeof registry.schema_version, 'number');
    assert.ok(registry.schema_version >= 1);
  });

  it('has universities array', () => {
    assert.ok(Array.isArray(registry.universities));
    assert.ok(registry.universities.length > 0, 'should have at least one university');
  });

  it('each university entry has required fields', () => {
    for (const uni of registry.universities) {
      assert.ok(uni.id, `missing id for ${JSON.stringify(uni)}`);
      assert.ok(uni.name, `missing name for ${uni.id}`);
      assert.ok(uni.short_name, `missing short_name for ${uni.id}`);
      assert.ok(uni.slug, `missing slug for ${uni.id}`);
      assert.ok(['verified', 'pending'].includes(uni.status),
        `invalid status "${uni.status}" for ${uni.id}`);
    }
  });

  it('slugs are unique', () => {
    const slugs = registry.universities.map(u => u.slug);
    assert.equal(slugs.length, new Set(slugs).size, 'duplicate slugs found');
  });

  it('ids are unique', () => {
    const ids = registry.universities.map(u => u.id);
    assert.equal(ids.length, new Set(ids).size, 'duplicate ids found');
  });
});

// ---------------------------------------------------------------------------
// Individual university data files
// ---------------------------------------------------------------------------

describe('university data files', () => {
  const registry = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'universities.json'), 'utf-8'));

  for (const uni of registry.universities) {
    describe(uni.id, () => {
      const filePath = path.join(UNI_DIR, `${uni.slug}.json`);

      it('data file exists', () => {
        assert.ok(fs.existsSync(filePath), `missing data file for ${uni.slug}`);
      });

      it('has valid JSON', () => {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        assert.equal(typeof data, 'object');
      });

      it('has schema_version', () => {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        assert.equal(typeof data.schema_version, 'number');
        assert.ok(data.schema_version >= 1);
      });

      it('id matches registry', () => {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        assert.equal(data.id, uni.id);
      });

      it('slug matches registry', () => {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        assert.equal(data.slug, uni.slug);
      });

      it('status matches registry', () => {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        assert.equal(data.status, uni.status);
      });

      it('has sources array', () => {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        assert.ok(Array.isArray(data.sources), 'sources must be an array');
      });

            it('metadata explicitly defines implementation status for complex rules', () => {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (data.status === 'verified') {
         for (const rule of data.academic_rules) {
           if (rule.calculation_methods && rule.calculation_methods.wcgpa && rule.calculation_methods.wcgpa.supported) {
             assert.ok('implemented' in rule.calculation_methods.wcgpa, 'WCGPA must declare implemented status');
           }
           if (rule.calculation_methods && rule.calculation_methods.classification_cgpa && rule.calculation_methods.classification_cgpa.supported) {
             assert.ok('implemented' in rule.calculation_methods.classification_cgpa, 'Classification CGPA must declare implemented status');
           }
           if (rule.credit_selection_policy && rule.credit_selection_policy.enabled) {
             assert.ok('implemented' in rule.credit_selection_policy, 'Credit selection policy must declare implemented status');
           }
          }
        }
      });

      it('verified universities have non-empty grading scales (v2 schema)', () => {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (data.status === 'verified') {
          assert.ok(Array.isArray(data.academic_rules), 'verified university must have academic_rules');
          assert.ok(data.academic_rules.length > 0, 'verified university must have at least one academic rule');
          for (const rule of data.academic_rules) {
            assert.ok(Array.isArray(rule.grading_scales), `missing grading_scales in rule ${rule.id}`);
            assert.ok(rule.grading_scales.length > 0, `empty grading_scales in rule ${rule.id}`);
            for (const scale of rule.grading_scales) {
              assert.ok(Array.isArray(scale.grades), `missing grades in scale ${scale.id}`);
              for (const g of scale.grades) {
                assert.ok(typeof g.grade === 'string', 'grade must be a string');
                assert.ok(typeof g.counts === 'object', 'grade must have a counts object');
                if (g.counts.gpa) {
                   assert.ok(typeof g.point === 'number' || g.point === null, 'point must be a number or null');
                }
              }
            }
          }
          assert.ok(data.sources.length > 0, 'verified university must have at least one source');
        }
      });

      it('sources have required fields when present', () => {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        for (const src of data.sources) {
          assert.ok(src.title, 'source must have title');
          assert.ok(src.verified_date, 'source must have verified_date');
        }
      });
    });
  }
});

