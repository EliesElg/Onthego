import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DayPlanComponent } from '../day-plan/day-plan.component';

@Component({
  selector: 'app-day-navigator',
  standalone: true,  
  imports: [CommonModule, DayPlanComponent],
  templateUrl: './day-navigator.component.html',
  styleUrl: './day-navigator.component.scss'
})
export class DayNavigatorComponent {
  @Input() days!: any[];
  currentIndex: number = 0;

  get currentDay() {
    return this.days ? this.days[this.currentIndex] : null;
  }

  nextDay() {
    if (this.currentIndex < this.days.length - 1) {
      this.currentIndex++;
    }
  }

  prevDay() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }
}