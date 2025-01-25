import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImplementComponent } from './implement.component';

describe('ImplementComponent', () => {
  let component: ImplementComponent;
  let fixture: ComponentFixture<ImplementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImplementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImplementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
