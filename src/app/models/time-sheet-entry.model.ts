// Defines the structure for a single time sheet entry
export interface TimeSheetEntry {
  startDateTime: Date;
  endDateTime: Date;
  description: string
  overlapping?: boolean; // Optional
}

