const ResultUI = {
  renderEmptyState: function(container) {
    container.innerHTML = `
      <div class="gpa-result-box" aria-live="polite">
        <h2 class="result-title">Your Result</h2>
        <div class="result-score">-</div>
        <div class="result-details">Enter your data to see your result</div>
      </div>
    `;
  },

  renderAllExcludedState: function(container) {
    container.innerHTML = `
      <div class="gpa-result-box" aria-live="polite">
        <h2 class="result-title">Your Result</h2>
        <div class="result-score">N/A</div>
        <div class="result-details">No contributing courses.</div>
      </div>
    `;
  },

  renderErrorsState: function(container) {
    container.innerHTML = `
      <div class="gpa-result-box has-errors" aria-live="polite">
        <h2 class="result-title">Unable to calculate</h2>
        <div class="result-score">-</div>
        <div class="result-details error-text">Please fix the highlighted fields.</div>
      </div>
    `;
  },

  renderGPAResult: function(container, result, incompleteCount = 0) {
    let incompleteNotice = '';
    if (incompleteCount > 0) {
      const s = incompleteCount === 1 ? '' : 's';
      incompleteNotice = `<div class="incomplete-notice">${incompleteCount} incomplete course${s} excluded.</div>`;
    }

    container.innerHTML = `
      <div class="gpa-result-box calculated animate-fade-in" aria-live="polite">
        <h2 class="result-title">Your GPA</h2>
        <div class="result-score">
          ${result.gpa.toFixed(2)}
          <span class="result-scale">/ 4.00</span>
        </div>
        
        <div class="result-stats">
          <div class="stat-item">
            <span class="stat-label">Credits Counted</span>
            <span class="stat-value">${result.totalCredits}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Quality Points</span>
            <span class="stat-value">${result.totalQualityPoints.toFixed(2)}</span>
          </div>
        </div>
        ${incompleteNotice}
      </div>
    `;
  },

  renderCGPAResult: function(container, result, incompleteCount = 0, scale = 4.00) {
    let incompleteNotice = '';
    if (incompleteCount > 0) {
      const s = incompleteCount === 1 ? '' : 's';
      incompleteNotice = `<div class="incomplete-notice">${incompleteCount} incomplete semester${s} excluded.</div>`;
    }

    container.innerHTML = `
      <div class="gpa-result-box calculated animate-fade-in" aria-live="polite">
        <h2 class="result-title">Your CGPA</h2>
        <div class="result-score">
          ${result.cgpa.toFixed(2)}
          <span class="result-scale">/ ${scale.toFixed(2)}</span>
        </div>
        
        <div class="result-stats">
          <div class="stat-item" style="width: 100%;">
            <span class="stat-label">Credits Counted</span>
            <span class="stat-value">${result.totalCredits}</span>
          </div>
        </div>
        ${incompleteNotice}
      </div>
    `;
  },

  renderWAMResult: function(container, result, incompleteCount = 0) {
    let incompleteNotice = '';
    if (incompleteCount > 0) {
      const s = incompleteCount === 1 ? '' : 's';
      incompleteNotice = `<div class="incomplete-notice">${incompleteCount} incomplete unit${s} excluded.</div>`;
    }

    const scoreDisplay = result.score.toFixed(3);
    const suffix = result.resultFormat === 'percentage' ? '' : ''; // Usually WAM is just the number out of 100, but Monash doesn't use the % symbol natively in official transcripts, so we omit suffix.

    container.innerHTML = `<div class="gpa-result-box calculated animate-fade-in" aria-live="polite">
        <h2 class="result-title">Your ${result.resultLabel}</h2>
        <div class="result-score">
          ${scoreDisplay} <span class="result-scale">out of 100</span>
        </div>
        
        <div class="result-stats" style="gap: 1rem;">
          <div class="stat-item">
            <span class="stat-label">Units Counted</span>
            <span class="stat-value">${result.includedCount}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Weighted Credits</span>
            <span class="stat-value">${result.totalWeightedCredits}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Excluded Units</span>
            <span class="stat-value">${result.excludedCount}</span>
          </div>
        </div>
        ${incompleteNotice}
      </div>`;
  }
};

if (typeof module !== 'undefined') {
  module.exports = ResultUI;
}

if (typeof window !== 'undefined') {
  window.ResultUI = ResultUI;
}
