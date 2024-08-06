import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrGalonComponent } from './trGalon.component';

describe('TrGalonComponent', () => {
  let component: TrGalonComponent;
  let fixture: ComponentFixture<TrGalonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TrGalonComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrGalonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
