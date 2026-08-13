document.addEventListener('DOMContentLoaded', () => {
  const wamMount = document.getElementById('wam-calculator-mount');
  if (wamMount) {
    initWamCalculator(wamMount);
  }
});

function initWamCalculator(mountEl) {
  const slug = mountEl.getAttribute('data-slug');
  if (!slug) return;

  const data = window.__UNIVERSITY_DATA__ && window.__UNIVERSITY_DATA__[slug];
  if (!data) {
    mountEl.innerHTML = '<div class="error-state">Failed to load grading rules for this university.</div>';
    return;
  }

  const gradingConfig = data.academic_rules[0].grading_scales[0];
  const calculationMethod = data.academic_rules[0].calculation_methods.primary;
  const exclusions = data.academic_rules[0].grading_scales[0].grades.filter(g => 
    typeof g.point !== 'number' && typeof g.min_mark !== 'number' && typeof g.max_mark !== 'number' || g.grade === 'WN'
  );

  mountEl.innerHTML = `
    <div class="calculator-header">
      <h2>Your Units</h2>
    </div>
    <div id="course-list-wam" class="course-list"></div>
    <div class="calculator-actions">
      <button id="btn-add-course-wam" class="btn btn-secondary">+ Add Unit</button>
      <button id="btn-clear-all-wam" class="btn btn-text">Clear All</button>
    </div>
    <div id="result-container-wam" class="result-container"></div>
  `;

  const unitList = document.getElementById('course-list-wam');
  const btnAdd = document.getElementById('btn-add-course-wam');
  const btnClear = document.getElementById('btn-clear-all-wam');
  const resultContainer = document.getElementById('result-container-wam');

  const addUnitRow = (initialData = null) => {
    const rowCount = unitList.children.length;
    const row = WamRow.createWamRow(rowCount, gradingConfig, initialData);
    
    row.querySelector('.btn-remove').addEventListener('click', () => {
      if (unitList.children.length > 1) {
        row.remove();
        handleInput();
      }
    });

    row.querySelectorAll('input, select').forEach(el => {
      el.addEventListener('input', handleInput);
      el.addEventListener('change', handleInput);
    });

    unitList.appendChild(row);
  };

  const calculateAndRender = () => {
    const rows = Array.from(unitList.children);
    let hasErrors = false;
    let incompleteCount = 0;
    const unitsForEngine = [];

    // We reuse course-row error styles
    rows.forEach(row => { row.classList.remove('has-error'); const m = row.querySelector('.row-error-message'); if(m) { m.style.display='none'; } });

    const rawData = rows.map(row => WamRow.getWamData(row));
    Storage.saveCalculatorState('wam', slug, rawData);

    rawData.forEach((unit, index) => {
      const rowEl = rows[index];
      const hasCredits = unit.creditsStr.trim() !== '';
      const hasYear = unit.yearLevel.trim() !== '';
      
      let isPopulated = false;
      if (unit.type === 'mark' && unit.markValue.trim() !== '') isPopulated = true;
      if (unit.type === 'special' && unit.specialValue.trim() !== '') isPopulated = true;

      if (!hasCredits && !hasYear && !isPopulated && unit.name.trim() === '') return;

      if (!hasCredits || !hasYear || !isPopulated) {
        incompleteCount++;
        return; 
      }

      unitsForEngine.push({ 
        name: unit.name, 
        credits: unit.creditsStr, 
        yearLevel: unit.yearLevel,
        mark: unit.type === 'mark' ? unit.markValue : null,
        specialResult: unit.type === 'special' ? unit.specialValue : null
      });
    });

    if (hasErrors) {
      ResultUI.renderErrorsState(resultContainer);
      return;
    }

    if (unitsForEngine.length === 0) {
      ResultUI.renderEmptyState(resultContainer);
      return;
    }

    const result = WamEngine.calculateWAM(unitsForEngine, calculationMethod, exclusions);

    if (window.MST_Analytics) window.MST_Analytics.trackCalculation("wam", slug);

    if (!result.success) {
      // Render errors
      ResultUI.renderErrorsState(resultContainer);
      return;
    }

    if (result.includedCount === 0) {
      ResultUI.renderAllExcludedState(resultContainer);
    } else {
      ResultUI.renderWAMResult(resultContainer, result, incompleteCount);
    }
  };

  let debounceTimeout;
  const handleInput = () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(calculateAndRender, 150);
  };

  const savedState = Storage.loadCalculatorState('wam', slug);
  if (savedState && Array.isArray(savedState) && savedState.length > 0) {
    savedState.forEach(unitData => addUnitRow(unitData));
  } else {
    for (let i = 0; i < 4; i++) { addUnitRow(); }
  }

  btnAdd.addEventListener('click', () => {
    addUnitRow();
    handleInput();
  });

  btnClear.addEventListener('click', () => {
    Storage.clearCalculatorState('wam', slug);
    unitList.innerHTML = '';
    for (let i = 0; i < 4; i++) { addUnitRow(); }
    handleInput();
  });

  handleInput();
}
