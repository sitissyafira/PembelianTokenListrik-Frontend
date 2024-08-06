import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountBudgetComponent } from './accountBudget.component';


const routes: Routes = [
  { path: "", component: AccountBudgetComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountBudgetRoutingModule { }
