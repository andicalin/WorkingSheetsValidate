// Summarizes the time sheet data for a single day
export interface Summary {
  startDate: string;
  endDate:string;
  hoursWorked: string;
  numEntries: number;
  flags: string;
  description:string;
  overlapping: Boolean,
  overlappingDetails:string,
}

