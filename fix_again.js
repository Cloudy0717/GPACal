const fs = require('fs');

function revert(file) {
    let c = fs.readFileSync(file, 'utf8');
    c = c.replace(/window\.Storage/g, 'Storage');
    c = c.replace(/window\.UniversityLoader/g, 'UniversityLoader');
    c = c.replace(/window\.CourseRow/g, 'CourseRow');
    c = c.replace(/window\.SemesterRow/g, 'SemesterRow');
    c = c.replace(/window\.ResultUI/g, 'ResultUI');
    c = c.replace(/window\.GpaEngine/g, 'GpaEngine');
    c = c.replace(/window\.CgpaEngine/g, 'CgpaEngine');
    c = c.replace(/window\.WamRow/g, 'WamRow');
    c = c.replace(/window\.WamEngine/g, 'WamEngine');
    
    fs.writeFileSync(file, c);
}

revert('src/js/app.js');
revert('src/js/app-wam.js');
