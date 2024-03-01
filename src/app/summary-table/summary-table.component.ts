import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Required for *ngIf and *ngFor
import { TimeSheetService } from '../time-sheet.service';
import { Summary } from '../models/summary-model';
import { TimeSheetEntry } from '../models/time-sheet-entry.model';
import { Subscription } from 'rxjs/internal/Subscription';


@Component({
  selector: 'app-summary-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary-table.component.html',
  styleUrl: './summary-table.component.scss'

})
export class SummaryTableComponent implements OnInit {
  summaryData: Summary[] = []; // Array to store summary data
  expandedRows = new Set<number>(); // Set to keep track of expanded rows by their indices
  // Subscription to manage the observable subscription
  private subscription: Subscription = new Subscription();

  constructor(private timeSheetService: TimeSheetService) { }


  ngOnInit(): void {
    // Subscribe to the timeSheetData$ observable to receive the time sheet data
    this.subscription.add(this.timeSheetService.summaryData.subscribe(data => {

      const getdata = data
      let tasks = this.timeSheetService.convertToUnixTime(getdata);
      // Sort tasks chronologically
      tasks.sort((a, b) => a.startDateTime.getTime() - b.startDateTime.getTime());

      // Iterate through tasks and find overlapping ones
      tasks.forEach((task, index) => {
        let overlapping = false;
        let overlappingDetails = "";

        for (let i = 0; i < tasks.length; i++) {
          if (i !== index && this.doTasksOverlap(task, tasks[i])) {
            overlapping = true;
            overlappingDetails += `overlapping with ${tasks[i].description}, `;
          }
        }

        // Add new attribute "overlapping" to the task object
        task.overlapping = overlapping;
        task.overlappingDetails = overlapping ? overlappingDetails : null;

        const durationMinutes = (task.endDateTime.getTime() - task.startDateTime.getTime()) / (1000 * 60);
        const formattedDuration = this.formatDuration(durationMinutes);
        console.log(`${task.startDateTime.getHours()}:${task.startDateTime.getMinutes()}\t\t${task.endDateTime.getHours()}:${task.endDateTime.getMinutes()}\t${formattedDuration}\t\t${overlapping ? overlappingDetails : ""}`);
      });

      this.summaryData = this.timeSheetService.summarizeDailyHours(tasks)

    }));
  }

  // Function to toggle the expansion state of a row by its index
  toggleRow(index: number): void {
    if (this.expandedRows.has(index)) {
      this.expandedRows.delete(index); // Collapse the row if it's already expanded
    } else {
      this.expandedRows.add(index); // Expand the row if it's collapsed
    }
  }

  // Function to check if two tasks overlap
  doTasksOverlap(task1: any, task2: any): boolean {
    return (task1.startDateTime < task2.endDateTime && task1.endDateTime > task2.startDateTime);
  }

  // Function to format duration as "1h20m"
  formatDuration(durationMinutes: number): string {
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return `${hours}h${minutes}m`;
  }


}
