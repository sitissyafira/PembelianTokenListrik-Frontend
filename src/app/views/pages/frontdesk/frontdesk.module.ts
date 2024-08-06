import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { CoreModule } from '../../../core/core.module';
import { PartialsModule } from '../../partials/partials.module';
import { FrontdeskComponent } from './frontdesk.component';

@NgModule({
	imports: [
		CommonModule,
		PartialsModule,
		CoreModule,
		RouterModule.forChild([
			{
				path: '',
				component: FrontdeskComponent
			},
		]),
	],
	providers: [],
	declarations: [
		FrontdeskComponent,
	]
})
export class FrontdeskModule {
}
