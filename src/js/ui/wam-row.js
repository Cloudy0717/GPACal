const WamRow = {
  createWamRow: function(index, gradingConfig, initialData = null) {
    const row = document.createElement('div');
    row.className = 'course-row wam-row'; 
    
    // Extract special excluded grades for the dropdown
    const excludedGrades = (gradingConfig.grades || []).filter(g => 
      typeof g.point !== 'number' && typeof g.min_mark !== 'number' && typeof g.max_mark !== 'number' || g.grade === 'WN'
    ).map(g => g.grade);

    let optionsHtml = '';
    excludedGrades.forEach(g => {
      const selected = (initialData && initialData.specialResult === g) ? 'selected' : '';
      optionsHtml += `<option value="${g}" ${selected}>${g}</option>`;
    });

    const initialName = initialData && initialData.name ? initialData.name : `Unit ${index + 1}`;
    const initialCredits = initialData && initialData.credits ? initialData.credits : '';
    const initialYear = initialData && initialData.yearLevel ? initialData.yearLevel : '';
    const initialMark = initialData && initialData.mark !== undefined && initialData.mark !== null ? initialData.mark : '';
    
    const isSpecial = initialData && initialData.specialResult ? true : false;

    const idPrefix = 'wam-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    row.innerHTML = `
      <div class="course-field course-name">
        <label for="${idPrefix}-name">Unit Code / Name</label>
        <input id="${idPrefix}-name" type="text" class="input-name" placeholder="e.g. MON1001" value="${initialName}">
      </div>
      
      <div class="course-field wam-result-type">
        <label for="${idPrefix}-type">Result Type</label>
        <select id="${idPrefix}-type" class="input-result-type">
          <option value="mark" ${!isSpecial ? 'selected' : ''}>Numeric Mark</option>
          <option value="special" ${isSpecial ? 'selected' : ''}>Special / Excluded</option>
        </select>
      </div>

      <div class="course-field course-mark" style="display: ${isSpecial ? 'none' : 'block'};">
        <label for="${idPrefix}-mark">Mark (%)</label>
        <input id="${idPrefix}-mark" type="number" class="input-mark" min="0" max="100" step="1" placeholder="e.g. 75" value="${initialMark}">
      </div>

      <div class="course-field course-special" style="display: ${isSpecial ? 'block' : 'none'};">
        <label for="${idPrefix}-special">Result Code</label>
        <select id="${idPrefix}-special" class="input-special">
          <option value="" disabled ${!isSpecial ? 'selected' : ''}>--</option>
          ${optionsHtml}
        </select>
      </div>

      <div class="course-field course-credits">
        <label for="${idPrefix}-credits">Credits</label>
        <input id="${idPrefix}-credits" type="number" class="input-credits" min="0.1" step="0.1" placeholder="e.g. 6" value="${initialCredits}">
      </div>

      <div class="course-field course-year">
        <label for="${idPrefix}-year">Year Level</label>
        <select id="${idPrefix}-year" class="input-year">
          <option value="" disabled ${!initialYear ? 'selected' : ''}>--</option>
          <option value="1" ${initialYear == '1' ? 'selected' : ''}>1</option>
          <option value="2" ${initialYear == '2' ? 'selected' : ''}>2</option>
          <option value="3" ${initialYear == '3' ? 'selected' : ''}>3</option>
          <option value="4" ${initialYear == '4' ? 'selected' : ''}>4</option>
          <option value="5" ${initialYear == '5' ? 'selected' : ''}>5</option>
        </select>
      </div>

      <div class="course-field course-action">
        <button class="btn-remove" aria-label="Remove Unit">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      <div class="row-error-message"></div>
    `;

    // Bind UI toggling
    const typeSelect = row.querySelector('.input-result-type');
    const markContainer = row.querySelector('.course-mark');
    const specialContainer = row.querySelector('.course-special');

    typeSelect.addEventListener('change', (e) => {
      if (e.target.value === 'mark') {
        markContainer.style.display = 'block';
        specialContainer.style.display = 'none';
      } else {
        markContainer.style.display = 'none';
        specialContainer.style.display = 'block';
      }
    });

    return row;
  },

  getWamData: function(rowElement) {
    const name = rowElement.querySelector('.input-name').value;
    const creditsStr = rowElement.querySelector('.input-credits').value;
    const yearLevel = rowElement.querySelector('.input-year').value;
    
    const type = rowElement.querySelector('.input-result-type').value;
    const mark = rowElement.querySelector('.input-mark').value;
    const specialResult = rowElement.querySelector('.input-special').value;

    return {
      name: name,
      creditsStr: creditsStr,
      yearLevel: yearLevel,
      type: type,
      markValue: type === 'mark' ? mark : '',
      specialValue: type === 'special' ? specialResult : ''
    };
  }
};

if (typeof module !== 'undefined') {
  module.exports = WamRow;
}

if (typeof window !== 'undefined') {
  window.WamRow = WamRow;
}
