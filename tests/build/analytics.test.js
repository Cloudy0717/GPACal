const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..', '..');
const DIST = path.join(ROOT, 'dist');

describe('Analytics Integration', () => {
  test('No GA script or file when GA4_MEASUREMENT_ID is absent', () => {
    execSync('npm run build', { cwd: ROOT, env: { ...process.env, GA4_MEASUREMENT_ID: '' } });
    const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
    assert.ok(!html.includes('googletagmanager.com'));
    assert.ok(!fs.existsSync(path.join(DIST, 'js', 'analytics.js')));
  });

  test('GA script and file exist when GA4_MEASUREMENT_ID is provided', () => {
    execSync('npm run build', { cwd: ROOT, env: { ...process.env, GA4_MEASUREMENT_ID: 'G-FAKE123' } });
    const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
    assert.ok(html.includes('googletagmanager.com/gtag/js?id=G-FAKE123'));
    assert.ok(html.includes('G-FAKE123'));
    assert.ok(fs.existsSync(path.join(DIST, 'js', 'analytics.js')));
    
    // Check that we're anonymizing IPs for privacy
    assert.ok(html.includes("'anonymize_ip': true"));
  });

  test('Calculation engines do not contain analytics code', () => {
    const gpaEngine = fs.readFileSync(path.join(ROOT, 'src', 'js', 'calculator', 'gpa-engine.js'), 'utf8');
    assert.ok(!gpaEngine.toLowerCase().includes('gtag'));
    assert.ok(!gpaEngine.toLowerCase().includes('analytics'));
  });
});
