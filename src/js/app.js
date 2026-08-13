// Main entry point for the application
document.addEventListener('DOMContentLoaded', () => {
  const gpaMount = document.getElementById('gpa-calculator');
  if (gpaMount) {
    initGpaCalculator(gpaMount);
  }
  const cgpaMount = document.getElementById('cgpa-calculator-mount');
  if (cgpaMount) {
    initCgpaCalculator(cgpaMount);
  }
});

function renderIntakeSection(container, data, slug, onChange) {
  const hasMultipleRules = data.academic_rules && data.academic_rules.length > 1;
  const savedYear = window.Storage.loadIntakeYear(slug) || new Date().getFullYear().toString();
  
  let html = '';
  if (hasMultipleRules) {
    let options = '';
    
    // Process unique intake options by examining rules
    data.academic_rules.forEach(rule => {
      let label = '';
      let val = '';
      if (rule.effective_from && !rule.effective_to) {
        const yr = rule.effective_from.split('-')[0];
        label = yr + ' or later';
        val = rule.effective_from;
      } else if (!rule.effective_from && rule.effective_to) {
        const yr = rule.effective_to.split('-')[0];
        label = yr + ' or earlier';
        // Pick a safe date before the effective_to cutoff
        val = (parseInt(yr) - 1) + '-01-01'; 
      } else if (rule.effective_from && rule.effective_to) {
        const yrF = rule.effective_from.split('-')[0];
        const yrT = rule.effective_to.split('-')[0];
        label = yrF + ' to ' + yrT;
        val = rule.effective_from;
      } else {
        label = 'Standard';
        val = '2000-01-01';
      }
      
      const sel = (val === savedYear) ? 'selected' : '';
      options += `<option value="${val}" ${sel}>${label}</option>`;
    });
    html = `
      <div class="intake-section">
        <div class="intake-selector-group">
          <label for="intake-year-select">When did you start your programme?</label>
          <select id="intake-year-select" class="input-grade" style="width:auto;">
             ${options}
          </select>
        </div>
        <div id="rule-active-notice" class="rule-active-notice"></div>
      </div>
    `;
  } else {
    html = `<div class="intake-section"><div id="rule-active-notice" class="rule-active-notice"></div></div>`;
  }
  
  container.innerHTML = html;
  
  const noticeEl = container.querySelector('#rule-active-notice');
  const selectEl = container.querySelector('#intake-year-select');
  
  const updateRule = (year) => {
     let rule = null;
     if (!hasMultipleRules) {
        // Fall back to first rule if only one exists (e.g. UTAR)
        rule = data.academic_rules[0];
     } else {
        // Year is already a valid date string mapped from the options
        rule = window.UniversityLoader.resolveAcademicRule(data, { intakeDate: year });
     }
     
     if (!rule) {
        noticeEl.innerHTML = `<div class="error-text" style="padding: 1rem; background: #fee2e2; border-left: 4px solid #ef4444; margin-bottom:1rem;">?? We don't currently have verified grading rules for your intake year.</div>`;
     } else {
        let ruleName = rule.id.replace(/_/g, ' ');
        if (rule.effective_from && rule.effective_to) {
            ruleName = `Intake ${rule.effective_from.split('-')[0]} to ${rule.effective_to.split('-')[0]}`;
        } else if (rule.effective_from) {
            ruleName = `${rule.effective_from.split('-')[0]} onwards`;
        } else if (rule.effective_to) {
            ruleName = `Pre-${parseInt(rule.effective_to.split('-')[0]) + 1} (Legacy)`;
        } else {
            ruleName = 'Standard undergraduate';
        }
        
        noticeEl.innerHTML = `<span class="badge" style="background:#e0e7ff;color:#3730a3;border:none;">? Using ${data.short_name} ${ruleName} grading rules</span>`;
     }
     onChange(rule);
  };
  
  if (selectEl) {
     selectEl.addEventListener('change', (e) => {
        window.Storage.saveIntakeYear(slug, e.target.value);
        updateRule(e.target.value);
     });
  }
  
  updateRule(savedYear);
}

function initGpaCalculator(mountEl) {
  const slug = mountEl.getAttribute('data-university');
  if (!slug) return;

  const data = window.__UNIVERSITY_DATA__ && window.__UNIVERSITY_DATA__[slug];
  if (!data) {
    mountEl.innerHTML = '<div class="error-state">Failed to load grading rules for this university.</div>';
    return;
  }

  mountEl.innerHTML = `
    <div id="intake-container"></div>
    <div id="calc-workspace" style="display:none;">
      <div class="calculator-header">
        <h2>Your Courses</h2>
      </div>
      <div id="course-list" class="course-list"></div>
      <div class="calculator-actions">
        <button id="btn-add-course" class="btn btn-secondary">+ Add Course</button>
        <button id="btn-clear-all" class="btn btn-text">Clear All</button>
      </div>
      <div id="result-container" class="result-container"></div>
    </div>
  `;

  const intakeContainer = document.getElementById('intake-container');
  const workspace = document.getElementById('calc-workspace');
  const courseList = document.getElementById('course-list');
  const btnAdd = document.getElementById('btn-add-course');
  const btnClear = document.getElementById('btn-clear-all');
  const resultContainer = document.getElementById('result-container');

  let currentGradingConfig = null;

  const addCourseRow = (initialData = null) => {
    const rowCount = courseList.children.length;
    const row = window.CourseRow.createCourseRow(rowCount, currentGradingConfig, initialData);
    
    row.querySelector('.btn-remove').addEventListener('click', () => {
      if (courseList.children.length > 1) {
        row.remove();
        handleInput();
      }
    });

    row.querySelectorAll('input, select').forEach(el => {
      el.addEventListener('input', handleInput);
      el.addEventListener('change', handleInput);
    });

    courseList.appendChild(row);
  };

  const calculateAndRender = () => {
    if (!currentGradingConfig) return;
    const rows = Array.from(courseList.children);
    let hasErrors = false;
    let incompleteCount = 0;
    const coursesForEngine = [];

    rows.forEach(row => window.CourseRow.clearError(row));

    const rawData = rows.map(row => window.CourseRow.getCourseData(row));
    window.Storage.saveCalculatorState('gpa', slug, rawData);

    rawData.forEach((c, index) => {
      const rowEl = rows[index];
      const hasCredits = c.creditsStr.trim() !== '';
      const hasGrade = c.gradeValue.trim() !== '';

      if (!hasCredits && !hasGrade && c.name.trim() === '') return;

      if (!hasCredits || !hasGrade) {
        incompleteCount++;
        return; 
      }

      const credits = Number(c.creditsStr);
      if (isNaN(credits) || credits <= 0) {
        window.CourseRow.showError(rowEl, 'Credits must be greater than 0.');
        hasErrors = true;
        return;
      }

      coursesForEngine.push({ name: c.name, credits: credits, grade: c.gradeValue });
    });

    if (hasErrors) {
      window.ResultUI.renderErrorsState(resultContainer);
      return;
    }

    if (coursesForEngine.length === 0) {
      window.ResultUI.renderEmptyState(resultContainer);
      return;
    }

    const result = window.GpaEngine.calculateGPA(coursesForEngine, currentGradingConfig);

    if (window.MST_Analytics) window.MST_Analytics.trackCalculation("gpa", slug);

    if (!result.success) {
      window.ResultUI.renderErrorsState(resultContainer);
      return;
    }

    if (result.totalCredits === 0) {
      window.ResultUI.renderAllExcludedState(resultContainer);
    } else {
      window.ResultUI.renderGPAResult(resultContainer, result, incompleteCount);
    }
  };

  let debounceTimeout;
  const handleInput = () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(calculateAndRender, 150);
  };

  renderIntakeSection(intakeContainer, data, slug, (rule) => {
    if (!rule) {
      workspace.style.display = 'none';
      return;
    }
    
    workspace.style.display = 'block';
    currentGradingConfig = window.UniversityLoader.getGradingScale(rule);
    
    if (courseList.children.length === 0) {
      // First load
      const savedState = window.Storage.loadCalculatorState('gpa', slug);
      if (savedState && Array.isArray(savedState) && savedState.length > 0) {
        savedState.forEach(courseData => addCourseRow(courseData));
      } else {
        for (let i = 0; i < 5; i++) { addCourseRow(); }
      }
    } else {
      // Rule changed, update rows
      Array.from(courseList.children).forEach(row => {
        window.CourseRow.updateGradingConfig(row, currentGradingConfig);
      });
    }
    handleInput();
  });

  btnAdd.addEventListener('click', () => {
    addCourseRow();
    handleInput();
  });

  btnClear.addEventListener('click', () => {
    window.Storage.clearCalculatorState('gpa', slug);
    courseList.innerHTML = '';
    for (let i = 0; i < 5; i++) { addCourseRow(); }
    handleInput();
  });
}

function initCgpaCalculator(mountEl) {
  const slug = mountEl.getAttribute('data-slug');
  if (!slug) return;

  const data = window.__UNIVERSITY_DATA__ && window.__UNIVERSITY_DATA__[slug];
  if (!data) {
    mountEl.innerHTML = '<div class="error-state">Failed to load grading rules for this university.</div>';
    return;
  }

  mountEl.innerHTML = `
    <div id="intake-container-cgpa"></div>
    <div id="feature-warning-cgpa"></div>
    <div id="calc-workspace-cgpa" style="display:none;">
      <div class="calculator-header">
        <h2>Your Semesters</h2>
      </div>
      <div id="course-list-cgpa" class="course-list"></div>
      <div class="calculator-actions">
        <button id="btn-add-course-cgpa" class="btn btn-secondary">+ Add Semester</button>
        <button id="btn-clear-all-cgpa" class="btn btn-text">Clear All</button>
      </div>
      <div id="result-container-cgpa" class="result-container"></div>
    </div>
  `;

  const intakeContainer = document.getElementById('intake-container-cgpa');
  const workspace = document.getElementById('calc-workspace-cgpa');
  const semesterList = document.getElementById('course-list-cgpa');
  const btnAdd = document.getElementById('btn-add-course-cgpa');
  const btnClear = document.getElementById('btn-clear-all-cgpa');
  const resultContainer = document.getElementById('result-container-cgpa');

  let currentGradingConfig = null;
  let maxGPA = 4.0;

  const addSemesterRow = (initialData = null) => {
    const rowCount = semesterList.children.length;
    const row = window.SemesterRow.createSemesterRow(rowCount, currentGradingConfig, initialData);
    
    row.querySelector('.btn-remove').addEventListener('click', () => {
      if (semesterList.children.length > 1) {
        row.remove();
        handleInput();
      }
    });

    row.querySelectorAll('input').forEach(el => {
      el.addEventListener('input', handleInput);
      el.addEventListener('change', handleInput);
    });

    semesterList.appendChild(row);
  };

  const calculateAndRender = () => {
    if (!currentGradingConfig) return;
    const rows = Array.from(semesterList.children);
    let hasErrors = false;
    let incompleteCount = 0;
    const semestersForEngine = [];

    rows.forEach(row => window.CourseRow.clearError(row));

    const rawData = rows.map(row => window.SemesterRow.getSemesterData(row));
    window.Storage.saveCalculatorState('cgpa', slug, rawData);

    rawData.forEach((sem, index) => {
      const rowEl = rows[index];
      const hasGPA = sem.gpaStr.trim() !== '';
      const hasCredits = sem.creditsStr.trim() !== '';

      if (!hasGPA && !hasCredits && sem.name.trim() === '') return;

      if (!hasGPA || !hasCredits) {
        incompleteCount++;
        return; 
      }

      const gpa = Number(sem.gpaStr);
      const credits = Number(sem.creditsStr);

      if (isNaN(gpa) || gpa < 0 || gpa > maxGPA) {
        window.CourseRow.showError(rowEl, `GPA must be between 0 and ${maxGPA}.`);
        hasErrors = true;
        return;
      }
      if (isNaN(credits) || credits <= 0) {
        window.CourseRow.showError(rowEl, 'Credits must be greater than 0.');
        hasErrors = true;
        return;
      }

      semestersForEngine.push({ name: sem.name, gpa: gpa, credits: credits });
    });

    if (hasErrors) {
      window.ResultUI.renderErrorsState(resultContainer);
      return;
    }

    if (semestersForEngine.length === 0) {
      window.ResultUI.renderEmptyState(resultContainer);
      return;
    }

    const result = window.CgpaEngine.calculateCGPA(semestersForEngine);

    if (window.MST_Analytics) window.MST_Analytics.trackCalculation("cgpa", slug);

    if (!result.success) {
      window.ResultUI.renderErrorsState(resultContainer);
      return;
    }

    window.ResultUI.renderCGPAResult(resultContainer, result, incompleteCount, maxGPA);
  };

  let debounceTimeout;
  const handleInput = () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(calculateAndRender, 150);
  };

  renderIntakeSection(intakeContainer, data, slug, (rule) => {
    if (!rule) {
      workspace.style.display = 'none';
      return;
    }
    
    workspace.style.display = 'block';
    currentGradingConfig = window.UniversityLoader.getGradingScale(rule);
    
    const warningContainer = document.getElementById('feature-warning-cgpa');
    let warnings = [];
    if (rule.credit_selection_policy && rule.credit_selection_policy.enabled && rule.credit_selection_policy.implemented === false) {
      warnings.push(`?? <strong>Elective Optimization:</strong> This calculator provides a standard cumulative calculation and does not automatically remove excess elective credits. Your official CGPA may differ.`);
    }
    if (rule.calculation_methods && rule.calculation_methods.wcgpa && rule.calculation_methods.wcgpa.supported && rule.calculation_methods.wcgpa.implemented === false) {
      warnings.push(`?? <strong>WCGPA:</strong> Your programme may use a Weighted CGPA for final classification. This tool calculates standard unweighted CGPA only.`);
    }
    if (warnings.length > 0) {
      warningContainer.innerHTML = `<div class="info-callout" style="background: #fff3cd; border-left: 4px solid #ffc107; margin-bottom: 1.5rem; padding: 15px;">${warnings.join('<br><br>')}</div>`;
    } else {
      warningContainer.innerHTML = '';
    }

    maxGPA = 4.0;
    if (currentGradingConfig && Array.isArray(currentGradingConfig.grades)) {
      maxGPA = Math.max(...currentGradingConfig.grades.filter(g => typeof g.point === 'number').map(g => g.point));
      if (maxGPA < 0 || !isFinite(maxGPA)) maxGPA = 4.0;
    }

    if (semesterList.children.length === 0) {
      const savedState = window.Storage.loadCalculatorState('cgpa', slug);
      if (savedState && Array.isArray(savedState) && savedState.length > 0) {
        savedState.forEach(semData => addSemesterRow(semData));
      } else {
        for (let i = 0; i < 2; i++) { addSemesterRow(); }
      }
    } else {
      Array.from(semesterList.children).forEach(row => {
        window.SemesterRow.updateGradingConfig(row, currentGradingConfig);
      });
    }
    handleInput();
  });

  btnAdd.addEventListener('click', () => {
    addSemesterRow();
    handleInput();
  });

  btnClear.addEventListener('click', () => {
    window.Storage.clearCalculatorState('cgpa', slug);
    semesterList.innerHTML = '';
    for (let i = 0; i < 2; i++) { addSemesterRow(); }
    handleInput();
  });
}




