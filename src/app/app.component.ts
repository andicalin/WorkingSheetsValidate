import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { SummaryTableComponent } from './summary-table/summary-table.component';
import { TimeSheetTableComponent } from './time-sheet-table/time-sheet-table.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, TimeSheetTableComponent, SummaryTableComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ValidatingSheetsAngular';
}
