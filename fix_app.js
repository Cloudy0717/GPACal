const fs = require('fs');
let c = fs.readFileSync('src/js/app.js', 'utf8');

c = c.replace(/options \+= <option value=" \+ val \+ "  \+ sel \+ > \+ label \+ <\/option>;/g, "options += \<option value=\"\\" \>\</option>\;");
c = c.replace(/html =\s*<div class="intake-section">[\s\S]*?<\/div>\s*;/g, "html = \n      <div class=\"intake-section\">\n        <div class=\"intake-selector-group\">\n          <label for=\"intake-year-select\">When did you start your programme?</label>\n          <select id=\"intake-year-select\" class=\"input-grade\" style=\"width:auto;\">\n             \n          </select>\n        </div>\n        <div id=\"rule-active-notice\" class=\"rule-active-notice\"></div>\n      </div>\n    ;");
c = c.replace(/html = <div class="intake-section"><div id="rule-active-notice" class="rule-active-notice"><\/div><\/div>;/g, "html = <div class=\"intake-section\"><div id=\"rule-active-notice\" class=\"rule-active-notice\"></div></div>;");

c = c.replace(/noticeEl\.innerHTML = <div class="error-text"[^>]*>\?\? We don't currently have verified grading rules for your intake year\.<\/div>;/g, "noticeEl.innerHTML = <div class=\"error-text\" style=\"padding: 1rem; background: #fee2e2; border-left: 4px solid #ef4444; margin-bottom:1rem;\">⚠️ We don't currently have verified grading rules for your intake year.</div>;");

c = c.replace(/ruleName = rule\.id\.replace\(\/_.*?\);/g, "");
c = c.replace(/if \(rule\.effective_from && rule\.effective_to\) \{[\s\S]*?\} else \{[\s\S]*?ruleName = Standard undergraduate;\n        \}/g, 
"if (rule.effective_from && rule.effective_to) {\n            ruleName = Intake  to ;\n        } else if (rule.effective_from) {\n            ruleName = ${rule.effective_from.split('-')[0]} onwards;\n        } else if (rule.effective_to) {\n            ruleName = Pre- (Legacy);\n        } else {\n            ruleName = 'Standard undergraduate';\n        }");

c = c.replace(/noticeEl\.innerHTML = <span class="badge"[^>]*>\? Using  \+ data\.short_name \+   \+ ruleName \+  grading rules<\/span>;/g, "noticeEl.innerHTML = <span class=\"badge\" style=\"background:#e0e7ff;color:#3730a3;border:none;\">✓ Using   grading rules</span>;");

c = c.replace(/mountEl\.innerHTML =\s*<div id="intake-container"><\/div>\s*<div id="calc-workspace" style="display:none;">\s*<div class="calculator-header">\s*<h2>Your Courses<\/h2>\s*<\/div>\s*<div id="course-list" class="course-list"><\/div>\s*<div class="calculator-actions">\s*<button id="btn-add-course" class="btn btn-secondary">\+ Add Course<\/button>\s*<button id="btn-clear-all" class="btn btn-text">Clear All<\/button>\s*<\/div>\s*<div id="result-container" class="result-container"><\/div>\s*<\/div>\s*;/g, 
"mountEl.innerHTML = \n    <div id=\"intake-container\"></div>\n    <div id=\"calc-workspace\" style=\"display:none;\">\n      <div class=\"calculator-header\">\n        <h2>Your Courses</h2>\n      </div>\n      <div id=\"course-list\" class=\"course-list\"></div>\n      <div class=\"calculator-actions\">\n        <button id=\"btn-add-course\" class=\"btn btn-secondary\">+ Add Course</button>\n        <button id=\"btn-clear-all\" class=\"btn btn-text\">Clear All</button>\n      </div>\n      <div id=\"result-container\" class=\"result-container\"></div>\n    </div>\n  ;");

c = c.replace(/window\.CourseRow\.showError\(rowEl, GPA must be between 0 and  \+ maxGPA \+ \.\);/g, "window.CourseRow.showError(rowEl, GPA must be between 0 and .);");

c = c.replace(/mountEl\.innerHTML =\s*<div id="intake-container-cgpa"><\/div>\s*<div id="feature-warning-cgpa"><\/div>\s*<div id="calc-workspace-cgpa" style="display:none;">\s*<div class="calculator-header">\s*<h2>Your Semesters<\/h2>\s*<\/div>\s*<div id="course-list-cgpa" class="course-list"><\/div>\s*<div class="calculator-actions">\s*<button id="btn-add-course-cgpa" class="btn btn-secondary">\+ Add Semester<\/button>\s*<button id="btn-clear-all-cgpa" class="btn btn-text">Clear All<\/button>\s*<\/div>\s*<div id="result-container-cgpa" class="result-container"><\/div>\s*<\/div>\s*;/g,
"mountEl.innerHTML = \n    <div id=\"intake-container-cgpa\"></div>\n    <div id=\"feature-warning-cgpa\"></div>\n    <div id=\"calc-workspace-cgpa\" style=\"display:none;\">\n      <div class=\"calculator-header\">\n        <h2>Your Semesters</h2>\n      </div>\n      <div id=\"course-list-cgpa\" class=\"course-list\"></div>\n      <div class=\"calculator-actions\">\n        <button id=\"btn-add-course-cgpa\" class=\"btn btn-secondary\">+ Add Semester</button>\n        <button id=\"btn-clear-all-cgpa\" class=\"btn btn-text\">Clear All</button>\n      </div>\n      <div id=\"result-container-cgpa\" class=\"result-container\"></div>\n    </div>\n  ;");

c = c.replace(/warnings\.push\(\?\? <strong>Elective Optimization:<\/strong> This calculator provides a standard cumulative calculation and does not automatically remove excess elective credits\. Your official CGPA may differ\.\);/g, "warnings.push(⚠️ <strong>Elective Optimization:</strong> This calculator provides a standard cumulative calculation and does not automatically remove excess elective credits. Your official CGPA may differ.);");

c = c.replace(/warnings\.push\(\?\? <strong>WCGPA:<\/strong> Your programme may use a Weighted CGPA for final classification\. This tool calculates standard unweighted CGPA only\.\);/g, "warnings.push(⚠️ <strong>WCGPA:</strong> Your programme may use a Weighted CGPA for final classification. This tool calculates standard unweighted CGPA only.);");

c = c.replace(/warningContainer\.innerHTML = <div class="info-callout" style="background: #fff3cd; border-left: 4px solid #ffc107; margin-bottom: 1\.5rem; padding: 15px;"> \+ warnings\.join\('<br><br>'\) \+ <\/div>;/g, "warningContainer.innerHTML = <div class=\"info-callout\" style=\"background: #fff3cd; border-left: 4px solid #ffc107; margin-bottom: 1.5rem; padding: 15px;\"></div>;");

fs.writeFileSync('src/js/app.js', c);
