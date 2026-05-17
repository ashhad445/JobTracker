import type { Job } from '../types';

// ─── CSV Export ───────────────────────────────────────────────────────────────
// No library needed — the browser can do this natively.
// 
// How it works:
//   1. Build a CSV string (comma-separated values, one job per row)
//   2. Wrap it in a Blob (a file-like object in memory)
//   3. Create a temporary URL pointing to that Blob
//   4. Create an invisible <a> element and "click" it to trigger a download
//   5. Clean up the URL so the browser can free the memory

export function exportToCSV(jobs: Job[]): void {
  if (jobs.length === 0) {
    alert('No jobs to export!');
    return;
  }

  // ── Build the CSV string ──────────────────────────────────────────────────
  // The first row is the header — column names.
  const headers = [
    'Company', 'Role', 'Status', 'Date Applied',
    'Salary', 'Priority', 'Interview Date',
    'Contact', 'Job Link', 'Notes',
  ];

  // Each job becomes one row. We use escapeCsvValue to handle commas and quotes
  // inside field values (e.g. a note that says "Google, LLC" would break the CSV
  // without escaping).
  const rows = jobs.map(job => [
    escapeCsvValue(job.company),
    escapeCsvValue(job.role),
    escapeCsvValue(job.columnId),
    escapeCsvValue(job.dateApplied),
    escapeCsvValue(job.salary ?? ''),
    escapeCsvValue(job.priority),
    escapeCsvValue(job.interviewDate ?? ''),
    escapeCsvValue(job.contactName ?? ''),
    escapeCsvValue(job.jobLink ?? ''),
    escapeCsvValue(job.notes ?? ''),
  ]);

  // Join everything into one big string.
  // \r\n is the standard CSV line ending (works on Windows and Mac).
  const csvContent = [
    headers.join(','),          // "Company,Role,Status,..."
    ...rows.map(r => r.join(',')), // "Google,Frontend Engineer,applied,..."
  ].join('\r\n');

  // ── Create the download ───────────────────────────────────────────────────
  // The \uFEFF at the start is a BOM (byte order mark) — it tells Excel
  // this file is UTF-8 encoded, so special characters render correctly.
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });

  // createObjectURL gives us a temporary "blob:" URL like:
  // "blob:http://localhost:5173/abc123..."
  const url = URL.createObjectURL(blob);

  // Create a hidden anchor tag and trigger a click to download
  const link = document.createElement('a');
  link.href = url;
  link.download = `job-tracker-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();

  // Clean up — remove the element and release the URL's memory
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── CSV escaping ─────────────────────────────────────────────────────────────
// If a value contains a comma, newline, or double-quote, we must wrap it in
// double quotes. Any existing double-quotes inside the value get doubled ("").
// e.g. She said "hello"  →  "She said ""hello"""
function escapeCsvValue(value: string): string {
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
