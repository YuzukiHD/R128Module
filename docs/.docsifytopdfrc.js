var pjson = require('./package.json');

module.exports = {
  contents: [ "_sidebar.md" ], // array of "table of contents" files path
  pathToPublic: "pdf/R128模组开发文档_" + pjson.version + ".pdf", // path where pdf will stored
  pdfOptions: "", // reference: https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagepdfoptions
  removeTemp: true, // remove generated .md and .html or not
  emulateMedia: "screen", // mediaType, emulating by puppeteer for rendering pdf, 'print' by default (reference: https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pageemulatemediamediatype)
}