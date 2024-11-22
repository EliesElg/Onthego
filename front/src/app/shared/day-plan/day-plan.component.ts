import { CommonModule } from '@angular/common';
import { Component, Input,  OnChanges, SimpleChanges } from '@angular/core';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-day-plan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './day-plan.component.html',
  styleUrls: ['./day-plan.component.scss']
})
export class DayPlanComponent implements OnChanges  {
  @Input() day: any;

  constructor(private imageService: ImageService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['day'] && this.day) {
      this.loadImagesForActivities();
    }
  }

  loadImagesForActivities() {
    this.day.activities.forEach((activity: any) => {
      this.loadImageForActivity(activity);
    });
  }

  loadImageForActivity(activity: any) {
    this.imageService.fetchImageForActivity(activity.lieu).subscribe((url: string | null) => {
      activity.imageUrl = url;
    });
  }
}