import { PicMember, MonthTableData, CellRecord } from '../types';

export const INITIAL_PICS: PicMember[] = [
  { id: 'pic-1', name: 'Nasrul', role: 'SPV Operation', active: true },
  { id: 'pic-2', name: 'Rully Gusfansyah', role: 'SPV Operation', active: true },
  { id: 'pic-3', name: 'Irfan Ramadhan', role: 'SPV Operation', active: true },
  { id: 'pic-4', name: 'Binoni Patria Tarigan', role: 'SPV Operation', active: true },
  { id: 'pic-5', name: 'Sandro Silalahi', role: 'SPV Operation', active: true },
  { id: 'pic-6', name: 'Romeo Napitupulu', role: 'SPV Operation', active: true },
  { id: 'pic-7', name: 'Anggriawan Dwiki Fathilda', role: 'SPV Operation', active: true },
  { id: 'pic-8', name: 'Moch Ravi Anang', role: 'SPV Operation', active: true },
  { id: 'pic-9', name: 'Putu Gede', role: 'SPV Operation', active: true },
  { id: 'pic-10', name: 'Sulthan Syachrul Ray\'yan', role: 'SPV Operation', active: true },
  { id: 'pic-11', name: 'Arthur Sengkandai', role: 'SPV Operation', active: true },
  { id: 'pic-12', name: 'Irvan Gandaria', role: 'SPV Operation', active: true },
  { id: 'pic-13', name: 'Aji Siswo Hutomo', role: 'SPV Operation', active: true },
];

const cChecked: CellRecord = { status: 'checked' };
const cUnchecked: CellRecord = { status: 'unchecked' };
const cProblem: CellRecord = { status: 'problem', note: 'Kendala operasional' };
const cDisabled: CellRecord = { status: 'disabled', note: 'Non-aktif / Cuti' };

export function generateInitialMonthData(): MonthTableData {
  const plan: Record<string, Record<number, CellRecord>> = {};
  const actual: Record<string, Record<number, CellRecord>> = {};

  INITIAL_PICS.forEach((pic) => {
    plan[pic.id] = {};
    actual[pic.id] = {};
    for (let d = 1; d <= 30; d++) {
      plan[pic.id][d] = { ...cUnchecked };
      actual[pic.id][d] = { ...cUnchecked };
    }
  });

  // Replicate Plan Harian from user screenshot
  // Nasrul: 1-5, 7-11
  [1, 2, 3, 4, 5, 7, 8, 9, 10, 11].forEach((d) => (plan['pic-1'][d] = { ...cChecked }));

  // Rully: 1-5, 7-11
  [1, 2, 3, 4, 5, 7, 8, 9, 10, 11].forEach((d) => (plan['pic-2'][d] = { ...cChecked }));

  // Irfan: 1-5, 7-11
  [1, 2, 3, 4, 5, 7, 8, 9, 10, 11].forEach((d) => (plan['pic-3'][d] = { ...cChecked }));

  // Binoni: 1, 2, 3 checked, 4 is red problem, 5 checked, 7-11 checked
  [1, 2, 3, 5, 7, 8, 9, 10, 11].forEach((d) => (plan['pic-4'][d] = { ...cChecked }));
  plan['pic-4'][4] = { ...cProblem };

  // Sandro: 1-5, 8-11
  [1, 2, 3, 4, 5, 8, 9, 10, 11].forEach((d) => (plan['pic-5'][d] = { ...cChecked }));

  // Romeo: 1-5, 7-11
  [1, 2, 3, 4, 5, 7, 8, 9, 10, 11].forEach((d) => (plan['pic-6'][d] = { ...cChecked }));

  // Anggriawan: 1-5, 7-11
  [1, 2, 3, 4, 5, 7, 8, 9, 10, 11].forEach((d) => (plan['pic-7'][d] = { ...cChecked }));

  // Moch Ravi Anang: 1-5, 7-8
  [1, 2, 3, 4, 5, 7, 8].forEach((d) => (plan['pic-8'][d] = { ...cChecked }));

  // Putu Gede: 1-5, 7-10
  [1, 2, 3, 4, 5, 7, 8, 9, 10].forEach((d) => (plan['pic-9'][d] = { ...cChecked }));

  // Sulthan Syachrul: days 1-13 disabled/white bar
  for (let d = 1; d <= 13; d++) {
    plan['pic-10'][d] = { ...cDisabled };
  }

  // Arthur: 1-3, 7-11
  [1, 2, 3, 7, 8, 9, 10, 11].forEach((d) => (plan['pic-11'][d] = { ...cChecked }));

  // Irvan Gandaria: 1-5, 7-11
  [1, 2, 3, 4, 5, 7, 8, 9, 10, 11].forEach((d) => (plan['pic-12'][d] = { ...cChecked }));

  // Aji Siswo: 1-5, 7-11
  [1, 2, 3, 4, 5, 7, 8, 9, 10, 11].forEach((d) => (plan['pic-13'][d] = { ...cChecked }));

  // Replicate Laporan Harian (Actual) from user screenshot
  // Nasrul: 1, 2, 7, 8, 9, 10
  [1, 2, 7, 8, 9, 10].forEach((d) => (actual['pic-1'][d] = { ...cChecked }));

  // Rully: 1-8, 10-12
  [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12].forEach((d) => (actual['pic-2'][d] = { ...cChecked }));

  // Irfan: 1-12
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].forEach((d) => (actual['pic-3'][d] = { ...cChecked }));

  // Binoni: 1-5, 7-12
  [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12].forEach((d) => (actual['pic-4'][d] = { ...cChecked }));

  // Sandro: 1-13
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].forEach((d) => (actual['pic-5'][d] = { ...cChecked }));

  // Romeo: 1-11
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].forEach((d) => (actual['pic-6'][d] = { ...cChecked }));

  // Anggriawan: 10, 11, 13
  [10, 11, 13].forEach((d) => (actual['pic-7'][d] = { ...cChecked }));

  // Moch Ravi Anang: 13
  [13].forEach((d) => (actual['pic-8'][d] = { ...cChecked }));

  // Putu Gede: 1-5, 7-12
  [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12].forEach((d) => (actual['pic-9'][d] = { ...cChecked }));

  // Sulthan Syachrul: days 1-13 disabled/white bar
  for (let d = 1; d <= 13; d++) {
    actual['pic-10'][d] = { ...cDisabled };
  }

  // Arthur: 1
  [1].forEach((d) => (actual['pic-11'][d] = { ...cChecked }));

  // Irvan: 1
  [1].forEach((d) => (actual['pic-12'][d] = { ...cChecked }));

  // Aji Siswo: 1-14
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].forEach((d) => (actual['pic-13'][d] = { ...cChecked }));

  return { plan, actual };
}
