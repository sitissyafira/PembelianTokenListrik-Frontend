import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GldetailComponent } from './gldetail.component';

describe('GldetailComponent', () => {
  let component: GldetailComponent;
  let fixture: ComponentFixture<GldetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GldetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GldetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
