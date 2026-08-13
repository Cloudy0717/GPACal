const fs = require('fs');

function revert(file) {
    let c = fs.readFileSync(file, 'utf8');
    c = c.replace(/ window\.Storage/g, ' window.Storage');
    c = c.replace(/ window\.UniversityLoader/g, ' window.UniversityLoader');
    c = c.replace(/ window\.CourseRow/g, ' window.CourseRow');
    c = c.replace(/ window\.SemesterRow/g, ' window.SemesterRow');
    c = c.replace(/ window\.ResultUI/g, ' window.ResultUI');
    c = c.replace(/ window\.GpaEngine/g, ' window.GpaEngine');
    c = c.replace(/ window\.CgpaEngine/g, ' window.CgpaEngine');
    c = c.replace(/ window\.WamRow/g, ' window.WamRow');
    c = c.replace(/ window\.WamEngine/g, ' window.WamEngine');
    
    fs.writeFileSync(file, c);
}

revert('src/js/app.js');
revert('src/js/app-wam.js');
