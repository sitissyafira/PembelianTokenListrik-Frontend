import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTrGalonComponent } from './add-trGalon.component';

describe('AddTrGalonComponent', () => {
  let component: AddTrGalonComponent;
  let fixture: ComponentFixture<AddTrGalonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddTrGalonComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTrGalonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
