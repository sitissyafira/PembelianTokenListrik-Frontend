import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockgroupComponent } from './blockgroup.component';

describe('BlockgroupComponent', () => {
  let component: BlockgroupComponent;
  let fixture: ComponentFixture<BlockgroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockgroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockgroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
