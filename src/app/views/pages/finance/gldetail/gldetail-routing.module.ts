import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GldetailComponent } from './gldetail.component';


const routes: Routes = [
  { path: "", component: GldetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GldetailRoutingModule { }
