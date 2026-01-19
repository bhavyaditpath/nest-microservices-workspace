// Simple template renderer
export function renderTemplate(templateName: string, data: any): string {
  // For simplicity, return a basic HTML
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