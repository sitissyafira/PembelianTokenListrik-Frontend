import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountBudgetComponent } from './accountBudget.component';

describe('AccountBudgetComponent', () => {
  let component: AccountBudgetComponent;
  let fixture: ComponentFixture<AccountBudgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountBudgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
