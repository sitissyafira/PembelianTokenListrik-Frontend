import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
// NGRX
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
// Translate
import { TranslateModule } from '@ngx-translate/core';
import { PartialsModule } from '../../partials/partials.module';
// Services
import { HttpUtilsService, TypesUtilsService, InterceptService, LayoutUtilsService} from '../../../core/_base/crud';
// Shared
import { ActionNotificationComponent } from '../../partials/content/crud';
// Components
import {ImportComponent} from './import.component';
// Material
import {
	MatInputModule,
	MatPaginatorModule,
	MatProgressSpinnerModule,
	MatSortModule,
	MatTableModule,
	MatSelectModule,
	MatMenuModule,
	MatProgressBarModule,
	MatButtonModule,
	MatCheckboxModule,
	MatDialogModule,
	MatTabsModule,
	MatNativeDateModule,
	MatCardModule,
	MatRadioModule,
	MatIconModule,
	MatDatepickerModule,
	MatExpansionModule,
	MatAutocompleteModule,
	MAT_DIALOG_DEFAULT_OPTIONS,
	MatSnackBarModule,
	MatTooltipModule
} from '@angular/material';
import {BuilderComponent} from '../../theme/content/builder/builder.component';
import {PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import {CoreModule} from '../../../core/core.module';
import {HighlightModule} from 'ngx-highlightjs';


@NgModule({
  declarations: [ImportComponent],
  imports: [
	  CommonModule,
	  PartialsModule,
	  FormsModule,
	  MatTabsModule,
	  CoreModule,
	  PerfectScrollbarModule,
	  HighlightModule,
	  RouterModule.forChild([
		  {
			  path: '',
			  component: ImportComponent
		  }
	  ]),
  ]
})
export class ImportModule { }
