import { safeStringify } from "../values";

type TableRow = any[];;
type Alignment = 'left' | 'center' | 'right';

const normalizeConsistentRows = (data: any[]): { headers: string[], rows: TableRow[] } => {
  let headers: string[] = [];
  let rows: TableRow[] = [];

  for (const item of data) {
    if (Array.isArray(item)) {
      rows.push(item);
    } else if (item && typeof item === 'object' && !Array.isArray(item)) {
      const keys = Object.keys(item);
      if (keys.length > headers.length) headers = keys;
      rows.push(keys.map(k => item[k]));
    } else {
      rows.push([item]);
    }
  }

  const maxCols = Math.max(headers.length, ...rows.map(row => row.length));
  const finalHeaders = headers.length > 0
    ? [...headers, ...Array.from({ length: maxCols - headers.length }, (_, i) => `Col ${headers.length + i + 1}`)]
    : Array.from({ length: maxCols }, (_, i) => `Col ${i + 1}`);

  const normalizedRows = rows.map(row =>
    Array.from({ length: maxCols }, (_, i) => row[i] ?? '')
  );

  return { headers: finalHeaders, rows: normalizedRows };
};

const generateSeparatorRow = (alignments: Alignment[], widths: number[]): string => {
  return '| ' + alignments.map((align, i) => {
    const width = widths[i];
    if (align === 'left') return ':' + '-'.repeat(width - 1);
    if (align === 'right') return '-'.repeat(width - 1) + ':';
    return ':' + '-'.repeat(width - 2) + ':';
  }).join(' | ') + ' |';
};

const formatCell = (text: string, width: number, align: Alignment): string => {
  const pad = width - text.length;
  if (align === 'left') return text + ' '.repeat(pad);
  if (align === 'right') return ' '.repeat(pad) + text;
  const left = Math.floor(pad / 2);
  const right = pad - left;
  return ' '.repeat(left) + text + ' '.repeat(right);
};

const formatRow = (values: string[], widths: number[], alignments: Alignment[]): string => {
  return '| ' + values.map((val, i) => formatCell(val, widths[i], alignments[i])).join(' | ') + ' |';
};

const calculateColumnWidths = (headers: string[], rows: string[][]): number[] => {
  return headers.map((_, i) => Math.max(
    headers[i].length,
    ...rows.map(row => safeStringify(row[i]).replace(/\n/g, ' ').length)
  ));
};

export const createMarkdownTable = (data: any[]): string => {
  if (!Array.isArray(data) || data.length === 0) return '';

  const { headers, rows } = normalizeConsistentRows(data);
  const alignments: Alignment[] = headers.map(() => 'center');
  const colWidths = calculateColumnWidths(headers, rows);

  const headerRow = formatRow(headers, colWidths, alignments);
  const separatorRow = generateSeparatorRow(alignments, colWidths);
  const dataRows = rows.map(row =>
    formatRow(
      row.map(cell =>
        safeStringify(cell).replace(/\|/g, '\\|').replace(/\n/g, ' ')
      ),
      colWidths,
      alignments
    )
  );

  return [headerRow, separatorRow, ...dataRows].join('\n');
};