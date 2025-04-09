import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCalendarComponent } from './update-calendar.component';

describe('UpdateCalendarComponent', () => {
  let component: UpdateCalendarComponent;
  let fixture: ComponentFixture<UpdateCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateCalendarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
