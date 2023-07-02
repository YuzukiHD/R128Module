var pjson = require('./package.json');

module.exports = {
  contents: [ "../_sidebar.md" ], // array of "table of contents" files path
  pathToPublic: "pdf/R128模组开发文档_" + pjson.version + ".pdf", // path where pdf will stored
  pdfOptions: {
    format: 'A4',
    displayHeaderFooter: true,
    headerTemplate: `<span></span>`,
    footerTemplate: `<div style='text-align:center;width: 297mm;font-size: 10px;'><span class='pageNumber'>inspur</span></div>`,
    margin: {
      top: '50px',
      right: '20px',
      bottom: '40px',
      left: '20px'
    },
    printBackground: true,
    omitBackground: true,
    landscape: false,     
  },
  removeTemp: true, // remove generated .md and .html or not
  emulateMedia: "screen", // mediaType, emulating by puppeteer for rendering pdf, 'print' by default (reference: https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pageemulatemediamediatype)
}