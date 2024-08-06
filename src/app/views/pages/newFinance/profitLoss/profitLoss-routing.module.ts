import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfitLossComponent } from './profitLoss.component';


const routes: Routes = [
  { path: "", component: ProfitLossComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfitLossRoutingModule { }
