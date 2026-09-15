export type CellStatusType = 'checked' | 'unchecked' | 'problem' | 'leave' | 'sick' | 'disabled';

export interface CellRecord {
  status: CellStatusType;
  note?: string;
  updatedAt?: string;
}

export interface PicMember {
  id: string;
  name: string;
  role?: string;
  active: boolean;
}

export interface MonthTableData {
  // Key: picId -> DayNumber (1..31) -> CellRecord
  plan: Record<string, Record<number, CellRecord>>;
  actual: Record<string, Record<number, CellRecord>>;
}

export interface OverallMonthState {
  year: number;
  month: number; // 0-11 (e.g. 8 for September)
  pics: PicMember[];
  data: MonthTableData;
}

export type ActiveViewTab = 'both' | 'plan' | 'actual' | 'comparison';
