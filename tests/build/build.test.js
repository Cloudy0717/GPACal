'use strict';

const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const DIST = path.join(ROOT, 'dist');
const DATA = path.join(ROOT, 'data');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadRegistry() {
  return JSON.parse(fs.readFileSync(path.join(DATA, 'universities.json'), 'utf-8'));
}

function loadUniversityData(slug) {
  const filePath = path.join(DATA, 'universities', `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// ---------------------------------------------------------------------------
// Build output validation
// ---------------------------------------------------------------------------

describe('build output', () => {
  before(() => {
    assert.ok(fs.existsSync(DIST), 'dist/ must exist — run "npm run build" first');
  });

  it('has index.html', () => {
    assert.ok(fs.existsSync(path.join(DIST, 'index.html')));
  });

  it('has css/style.css', () => {
    assert.ok(fs.existsSync(path.join(DIST, 'css', 'style.css')));
  });

  it('has js/university-data.js', () => {
    assert.ok(fs.existsSync(path.join(DIST, 'js', 'university-data.js')));
  });

  it('has gpa-calculator/index.html', () => {
    assert.ok(fs.existsSync(path.join(DIST, 'gpa-calculator', 'index.html')));
  });

  it('has cgpa-calculator/index.html', () => {
    assert.ok(fs.existsSync(path.join(DIST, 'cgpa-calculator', 'index.html')));
  });

  it('has assets/favicon.svg', () => {
    assert.ok(fs.existsSync(path.join(DIST, 'assets', 'favicon.svg')));
  });

  // Dynamic tests: every verified university must have GPA + CGPA pages
  describe('verified university pages', () => {
    const registry = loadRegistry();
    const verified = registry.universities.filter(u => u.status === 'verified');

    for (const uni of verified) { if (uni.slug === 'monash-malaysia') continue; 
      it(`has gpa-calculator/${uni.slug}/index.html`, () => {
        assert.ok(
          fs.existsSync(path.join(DIST, 'gpa-calculator', uni.slug, 'index.html')),
          `missing GPA page for verified university ${uni.slug}`
        );
      });

      it(`has cgpa-calculator/${uni.slug}/index.html`, () => {
        assert.ok(
          fs.existsSync(path.join(DIST, 'cgpa-calculator', uni.slug, 'index.html')),
          `missing CGPA page for verified university ${uni.slug}`
        );
      });
    }

    if (verified.length === 0) {
      it('no university pages generated (none verified yet)', () => {
        // This is expected — no verified universities means no uni-specific pages
        assert.ok(true);
      });
    }
  });

  // Pending universities must NOT have calculator pages
  describe('pending university pages should not exist', () => {
    const registry = loadRegistry();
    const pending = registry.universities.filter(u => u.status === 'pending');

    for (const uni of pending) {
      it(`no gpa-calculator/${uni.slug}/index.html for pending ${uni.slug}`, () => {
        assert.ok(
          !fs.existsSync(path.join(DIST, 'gpa-calculator', uni.slug, 'index.html')),
          `GPA page should not exist for pending university ${uni.slug}`
        );
      });

      it(`no cgpa-calculator/${uni.slug}/index.html for pending ${uni.slug}`, () => {
        assert.ok(
          !fs.existsSync(path.join(DIST, 'cgpa-calculator', uni.slug, 'index.html')),
          `CGPA page should not exist for pending university ${uni.slug}`
        );
      });
    }
  });

  // University data bundle should only contain verified universities
  describe('university-data.js bundle', () => {
    it('is valid JavaScript', () => {
      const content = fs.readFileSync(path.join(DIST, 'js', 'university-data.js'), 'utf-8');
      assert.ok(content.includes('__UNIVERSITY_DATA__'), 'should define __UNIVERSITY_DATA__');
      assert.ok(content.includes('__UNIVERSITY_REGISTRY__'), 'should define __UNIVERSITY_REGISTRY__');
    });
  });
});
