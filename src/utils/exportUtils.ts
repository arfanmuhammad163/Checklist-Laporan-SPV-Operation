import { PicMember, MonthTableData } from '../types';
import { INDONESIAN_MONTHS } from './dateUtils';

export function exportToCSV(
  pics: PicMember[],
  data: MonthTableData,
  month: number,
  year: number,
  totalDays: number
) {
  const monthName = INDONESIAN_MONTHS[month];
  const activePics = pics.filter((p) => p.active);

  let csvContent = 'data:text/csv;charset=utf-8,';

  // Title
  csvContent += `"LAPORAN HARIAN TEAM SPV OPR PERIODE ${monthName.toUpperCase()} ${year}"\r\n`;
  csvContent += `"Departemen Operation & Controlling"\r\n\r\n`;

  // SECTION 1: PLAN HARIAN
  csvContent += `"--- PLAN HARIAN ---"\r\n`;
  let headerRow = ['"PIC"'];
  for (let d = 1; d <= totalDays; d++) {
    headerRow.push(`"${d}"`);
  }
  headerRow.push('"Total Plan"');
  csvContent += headerRow.join(',') + '\r\n';

  activePics.forEach((pic) => {
    let row = [`"${pic.name}"`];
    let totalPlan = 0;
    for (let d = 1; d <= totalDays; d++) {
      const status = data.plan[pic.id]?.[d]?.status;
      if (status === 'checked') {
        row.push('"✓"');
        totalPlan++;
      } else if (status === 'problem') {
        row.push('"KENDALA"');
      } else if (status === 'leave') {
        row.push('"CUTI"');
      } else if (status === 'disabled') {
        row.push('"OFF"');
      } else {
        row.push('""');
      }
    }
    row.push(`"${totalPlan}"`);
    csvContent += row.join(',') + '\r\n';
  });

  csvContent += '\r\n';

  // SECTION 2: LAPORAN HARIAN (AKTUAL)
  csvContent += `"--- REALISASI LAPORAN HARIAN ---"\r\n`;
  csvContent += headerRow.slice(0, -1).join(',') + ',"Total Lapor"\r\n';

  activePics.forEach((pic) => {
    let row = [`"${pic.name}"`];
    let totalActual = 0;
    for (let d = 1; d <= totalDays; d++) {
      const status = data.actual[pic.id]?.[d]?.status;
      if (status === 'checked') {
        row.push('"✓"');
        totalActual++;
      } else if (status === 'problem') {
        row.push('"KENDALA"');
      } else if (status === 'leave') {
        row.push('"CUTI"');
      } else if (status === 'disabled') {
        row.push('"OFF"');
      } else {
        row.push('""');
      }
    }
    row.push(`"${totalActual}"`);
    csvContent += row.join(',') + '\r\n';
  });

  // Download
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute(
    'download',
    `Laporan_Harian_SPV_${monthName}_${year}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
