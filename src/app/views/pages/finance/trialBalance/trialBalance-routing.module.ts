import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TrialBalanceComponent } from './trialBalance.component';


const routes: Routes = [
  { path: "", component: TrialBalanceComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrialBalanceRoutingModule { }
