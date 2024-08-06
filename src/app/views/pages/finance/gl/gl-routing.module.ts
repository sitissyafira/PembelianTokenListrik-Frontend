import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GlComponent } from './gl.component';


const routes: Routes = [
  { path: "", component: GlComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GlRoutingModule { }
