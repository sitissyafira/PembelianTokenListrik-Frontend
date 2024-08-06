import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListBlockGroupComponent } from './list-block-group.component';

describe('ListBlockGroupComponent', () => {
  let component: ListBlockGroupComponent;
  let fixture: ComponentFixture<ListBlockGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListBlockGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListBlockGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
