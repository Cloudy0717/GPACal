const CourseRow = {
  createCourseRow: function(index, gradingConfig, initialData = null) {
    const row = document.createElement('div');
    row.className = 'course-row';
    
    // Extract all grades from v2 gradingConfig
    const allGrades = (gradingConfig.grades || []).map(g => g.grade);
    
    const optionsHtml = allGrades.map(g => {
      const selected = (initialData && initialData.grade === g) ? 'selected' : '';
      return `<option value="${g}" ${selected}>${g}</option>`;
    }).join('');

    const initialName = initialData && initialData.name ? initialData.name : '';
   const initialCredits = initialData && initialData.credits ? initialData.credits : '';
   
   // unique IDs for a11y
   const idPrefix = 'course-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

   row.innerHTML = `
     <div class="course-field course-name">
       <label for="${idPrefix}-name">Course Name</label>
       <input id="${idPrefix}-name" type="text" class="input-name" placeholder="Optional" value="${initialName}">
     </div>
     <div class="course-field course-credits">
       <label for="${idPrefix}-credits">Credits</label>
       <input id="${idPrefix}-credits" type="number" class="input-credits" min="0.1" step="0.1" placeholder="e.g. 3" value="${initialCredits}">
     </div>
     <div class="course-field course-grade">
       <label for="${idPrefix}-grade">Grade</label>
       <select id="${idPrefix}-grade" class="input-grade">
         <option value="" disabled ${!initialData || !initialData.grade ? 'selected' : ''}>--</option>
         ${optionsHtml}
       </select>
     </div>
     <div class="course-field course-action">
       <button class="btn-remove" aria-label="Remove Course">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      <div class="row-error-message"></div>
    `;

    return row;
  },

  getCourseData: function(rowElement) {
    const name = rowElement.querySelector('.input-name').value;
    const creditsStr = rowElement.querySelector('.input-credits').value;
    const grade = rowElement.querySelector('.input-grade').value;

    return {
      name: name,
      creditsStr: creditsStr,
      gradeValue: grade
    };
  },

  showError: function(rowElement, message) {
    rowElement.classList.add('has-error');
    const msgEl = rowElement.querySelector('.row-error-message');
    if (msgEl) {
      msgEl.textContent = message;
      msgEl.style.display = 'block';
    }
  },

  clearError: function(rowElement) {
    rowElement.classList.remove('has-error');
    const msgEl = rowElement.querySelector('.row-error-message');
    if (msgEl) {
      msgEl.textContent = '';
      msgEl.style.display = 'none';
    }
  },

  updateGradingConfig: function(rowElement, gradingConfig) {
    const selectEl = rowElement.querySelector('.input-grade');
    if (!selectEl) return;
    const currentVal = selectEl.value;
    
    const allGrades = (gradingConfig.grades || []).map(g => g.grade);
    let optionsHtml = `<option value="" disabled >--</option>`;
    optionsHtml += allGrades.map(g => {
      const selected = (currentVal === g) ? 'selected' : '';
      return `<option value="${g}" ${selected}>${g}</option>`;
    }).join('');
    
    selectEl.innerHTML = optionsHtml;
    
    if (currentVal && !allGrades.includes(currentVal)) {
      selectEl.value = '';
    }
  }
};

if (typeof module !== 'undefined') {
  module.exports = CourseRow;
}


