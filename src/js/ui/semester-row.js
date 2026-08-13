const SemesterRow = {
  createSemesterRow: function(index, gradingConfig, initialData = null) {
    const row = document.createElement('div');
    row.className = 'course-row semester-row'; // reusing course-row CSS for consistency
    
        let maxGPA = 4.0;
    if (gradingConfig && Array.isArray(gradingConfig.grades)) {
      maxGPA = Math.max(...gradingConfig.grades.filter(g => typeof g.point === 'number').map(g => g.point));
      if (maxGPA < 0 || !isFinite(maxGPA)) maxGPA = 4.0;
    }
    
    const initialName = initialData && initialData.name ? initialData.name : `Semester ${index + 1}`;
   const initialGPA = initialData && initialData.gpa ? initialData.gpa : '';
   const initialCredits = initialData && initialData.credits ? initialData.credits : '';
   
   // unique IDs for a11y
   const idPrefix = 'semester-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

   row.innerHTML = `
     <div class="course-field course-name">
       <label for="${idPrefix}-name">Semester Label</label>
       <input id="${idPrefix}-name" type="text" class="input-name" placeholder="e.g. Semester 1" value="${initialName}">
     </div>
     <div class="course-field course-gpa">
       <label for="${idPrefix}-gpa">Semester GPA</label>
       <input id="${idPrefix}-gpa" type="number" class="input-gpa" min="0" max="${maxGPA}" step="0.01" placeholder="e.g. 3.50" value="${initialGPA}">
     </div>
     <div class="course-field course-credits">
       <label for="${idPrefix}-credits">Semester Credits</label>
       <input id="${idPrefix}-credits" type="number" class="input-credits" min="0.1" step="0.1" placeholder="e.g. 18" value="${initialCredits}">
     </div>
     <div class="course-field course-action">
        <button class="btn-remove" aria-label="Remove Semester">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      <div class="row-error-message"></div>
    `;

    return row;
  },

  getSemesterData: function(rowElement) {
    const name = rowElement.querySelector('.input-name').value;
    const gpaStr = rowElement.querySelector('.input-gpa').value;
    const creditsStr = rowElement.querySelector('.input-credits').value;

    return {
      name: name,
      gpaStr: gpaStr,
      creditsStr: creditsStr
    };
  },

  updateGradingConfig: function(rowElement, gradingConfig) {
    const inputEl = rowElement.querySelector('.input-gpa');
    if (!inputEl) return;
    
    let maxGPA = 4.0;
    if (gradingConfig && Array.isArray(gradingConfig.grades)) {
      maxGPA = Math.max(...gradingConfig.grades.filter(g => typeof g.point === 'number').map(g => g.point));
      if (maxGPA < 0 || !isFinite(maxGPA)) maxGPA = 4.0;
    }
    
    inputEl.setAttribute('max', maxGPA);
  }
};

if (typeof module !== 'undefined') {
  module.exports = SemesterRow;
}


