import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayNavigatorComponent } from './day-navigator.component';

describe('DayNavigatorComponent', () => {
  let component: DayNavigatorComponent;
  let fixture: ComponentFixture<DayNavigatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DayNavigatorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DayNavigatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
