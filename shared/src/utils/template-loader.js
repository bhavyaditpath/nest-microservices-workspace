"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderTemplate = renderTemplate;
function renderTemplate(templateName, data) {
    if (templateName === 'report-email') {
        return `
      <h1>${data.reportTypeDisplay} Report</h1>
      <p>Report Type: ${data.reportTypeDisplay}</p>
      <p>Generated Date: ${data.generatedDate}</p>
      <p>User: ${data.userDisplay}</p>
    `;
    }
    return '';
}
//# sourceMappingURL=template-loader.js.map