import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBlockGroupComponent } from './edit-block-group.component';

describe('EditBlockGroupComponent', () => {
  let component: EditBlockGroupComponent;
  let fixture: ComponentFixture<EditBlockGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditBlockGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBlockGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
