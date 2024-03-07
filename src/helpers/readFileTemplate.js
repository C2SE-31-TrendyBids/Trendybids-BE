const fs = require('fs');
const path = require("path");
const handlebars = require("hbs");
const readFileTemplate = (fileName, value) => {
    const template = fs.readFileSync(path.join(`${__dirname}/../util/templates/${fileName}`), 'utf8');
    const compiledTemplate = handlebars.compile(template);
    return compiledTemplate({...value})
}

module.exports = readFileTemplate;