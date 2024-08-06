import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBlockGroupComponent } from './add-block-group.component';

describe('AddBlockGroupComponent', () => {
  let component: AddBlockGroupComponent;
  let fixture: ComponentFixture<AddBlockGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddBlockGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddBlockGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
