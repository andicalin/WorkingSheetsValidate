import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as Papa from 'papaparse';
import { TimeSheetEntry } from './models/time-sheet-entry.model'; // Adjust the path as necessary
import { Summary } from './models/summary-model';

@Injectable({
  providedIn: 'root'
})
export class TimeSheetService {
  // BehaviorSubject to hold the time sheet data. It's initialized with an empty array.
  private timeSheetData = new BehaviorSubject<any[]>([]);
  public summaryData = new BehaviorSubject<any[]>([]);


  // Publicly exposed observable for components to subscribe to.
  public timeSheetData$ = this.timeSheetData.asObservable();

  constructor() { }


  // Method to read and parse the CSV file. It takes a File object as input.
  readCsvData(file: File): void {
    Papa.parse(file, {
      complete: (result) => {
        // Assuming each row corresponds to an object with known properties
        const entries: TimeSheetEntry[] = result.data.map((row: any) => ({
          startDateTime: new Date(row["startDateTime"]),
          endDateTime: new Date(row["endDateTime"]),
          description: (row["description"]),
          // Assuming 'overlapping' is determined later or defaults to false
          overlapping: false,
        }));
        this.timeSheetData.next(result.data);
      },
      header: true, // Assuming the CSV has headers. This maps each row to an object with property names derived from the headers.
      skipEmptyLines: true, // Skips empty lines to ensure clean data.
      dynamicTyping: true, // Automatically converts strings to numbers, booleans, and nulls where appropriate.
    });
  }


  // method to validate time sheet data for overlaps
  validateDataForOverlaps(data: TimeSheetEntry[]): { isValid: boolean, overlaps: { first: TimeSheetEntry, second: TimeSheetEntry }[] } {
    let isValid = true;
    const overlaps: { first: TimeSheetEntry, second: TimeSheetEntry }[] = [];

    // Sort data by startDateTime for easier comparison
    const sortedData = [...data].sort((a, b) => a.startDateTime.getTime() - b.startDateTime.getTime());

    for (let i = 0; i < sortedData.length - 1; i++) {
      for (let j = i + 1; j < sortedData.length; j++) {
        if (sortedData[i].endDateTime > sortedData[j].startDateTime) {
          // Overlap detected
          isValid = false;
          overlaps.push({ first: sortedData[i], second: sortedData[j] });
          // Assuming we break after finding the first overlap for a pair
          break;
        }
      }
      if (!isValid) break; // Stop checking after finding the first overlap, remove if finding all overlaps
    }
    return { isValid, overlaps };
  }


  //Method to summarize the hours worked daily
  summarizeDailyHours(data: any[]): Summary[] {
    const summaryMap: { [date: string]: Summary } = {};

    data.forEach(entry => {
      const dateKey = JSON.stringify(entry.startDateTime)
      if (!summaryMap[dateKey]) {
        summaryMap[dateKey] = {
          description: entry.description,
          overlapping: entry.overlapping,
          overlappingDetails: entry.overlappingDetails,
          startDate: `${entry.startDateTime.getHours()}:${entry.startDateTime.getMinutes()}`,
          endDate: `${entry.endDateTime.getHours()}:${entry.endDateTime.getMinutes()}`,
          hoursWorked: '0',
          numEntries: 0,
          flags: '',
        };
      }
      const durationMilliseconds = entry.endDateTime.getTime() - entry.startDateTime.getTime();
      const durationMinutes = Math.floor(durationMilliseconds / (1000 * 60)); // Convert milliseconds to minutes

      let duration: string;
      if (durationMinutes < 60) {
        duration = `${durationMinutes} minute${durationMinutes !== 1 ? 's' : ''}`;
      } else {
        const hours = Math.floor(durationMinutes / 60);
        const remainingMinutes = durationMinutes % 60;
        duration = `${hours} hour${hours !== 1 ? 's' : ''}`;
        if (remainingMinutes > 0) {
          duration += ` ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
        }
      }

      summaryMap[dateKey].hoursWorked = duration;
      summaryMap[dateKey].numEntries++;

      const durationMinutesForFlag = (entry.endDateTime.getTime() - entry.startDateTime.getTime()) / (1000 * 60);

  // Check if duration is greater than 8 hours (480 minutes)
  if (durationMinutesForFlag > 480) {
    summaryMap[dateKey].flags = 'Overtime';
  }
    });

    return Object.values(summaryMap); // Directly returning the array of Summary objects
  }


  getSummaryData(): Observable<any[]> {
    // Placeholder for the actual summarization logic
    // This should return an Observable of the summary data
    return this.timeSheetData$.pipe(
      map(data => this.summarizeData(data)), // Assuming summarizeData is a method that summarizes your data
    );
  }

  // Example summarization method
  private summarizeData(data: any[]): any[] {
    const summary = data.reduce((acc, curr) => {
      // Summarization logic here
      // For example, aggregate hours worked per day, count entries, and identify flags
      return acc;
    }, {});

    // Convert summary object into an array or whatever format you need for display
    return Object.values(summary);
  }

  convertToUnixTime(tasks: any[]) {
    tasks.forEach(task => {
      task.startDateTime = new Date(task.startDateTime);
      task.endDateTime = new Date(task.endDateTime);
    });
    return tasks

  }

}
