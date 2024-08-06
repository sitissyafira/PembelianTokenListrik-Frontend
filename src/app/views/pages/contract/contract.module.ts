// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
// NGRX
import { ActionReducerMap, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
// Translate
import { TranslateModule } from '@ngx-translate/core';
import { PartialsModule } from '../../partials/partials.module';
// Services
import { HttpUtilsService, TypesUtilsService, InterceptService, LayoutUtilsService } from '../../../core/_base/crud';
// Shared
import { ActionNotificationComponent } from '../../partials/content/crud';
// Components

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
	MatTooltipModule,
} from '@angular/material';

import { ContractComponent } from './contract.component';
import { ListRenterComponent } from './renter/list-renter/list-renter.component';
import { ListRenterCheckOutComponent } from './renter/list-renter-checkout/list-renter-checkout.component';
import { AddRenterComponent } from './renter/add-renter/add-renter.component';
import { rentercontractReducer } from '../../../core/contract/renter/renter.reducer';
import { RenterContractEffect } from '../../../core/contract/renter/renter.effect';
import { ListOwnershipComponent } from './ownership/list-ownership/list-ownership.component';
import { AddOwnershipComponent } from './ownership/add-ownership/add-ownership.component';
import { OwnershipComponent } from './ownership/ownership.component';

import { RenterComponent } from './renter/renter.component';
import { EditRenterComponent } from './renter/edit-renter/edit-renter.component';
import { ViewRenterComponent } from './renter/view-renter/view-renter.component';
import { ownershipcontractReducer } from '../../../core/contract/ownership/ownership.reducer';
import { OwnershipContractEffect } from '../../../core/contract/ownership/ownership.effect';
import { EditOwnershipComponent } from './ownership/edit-ownership/edit-ownership.component';
import { ViewOwnershipComponent } from './ownership/view-ownership/view-ownership.component';
import { NgbTimepicker } from '@ng-bootstrap/ng-bootstrap';
import { ListPinjamPakaiComponent } from './pinjamPakai/list-pinjamPakai/list-pinjamPakai.component';
import { pinjamPakaiReducer } from '../../../core/contract/pinjamPakai/pinjamPakai.reducer';
import { PinjamPakaiEffect } from '../../../core/contract/pinjamPakai/pinjamPakai.effect';
import { PinjamPakaiComponent } from './pinjamPakai/pinjamPakai.component';
import { AddPinjamPakaiComponent } from './pinjamPakai/add-pinjamPakai/add-pinjamPakai.component';
import { EditPinjamPakaiComponent } from './pinjamPakai/edit-pinjamPakai/edit-pinjamPakai.component';
import { ViewPinjamPakaiComponent } from './pinjamPakai/view-pinjamPakai/view-pinjamPakai.component';

import { PopupPurchaseRequest } from './ownership/popup-purchaseRequest/popup-purchaseRequest.component';


const routes: Routes = [
	{
		path: '',
		component: ContractComponent,
		children: [
			{
				path: 'contract/guest',
				component: ListRenterComponent
			},
			{
				path: 'contract/guest/add',
				component: AddRenterComponent
			},
			{
				path: 'contract/guest/edit/:id',
				component: EditRenterComponent
			},
			{
				path: 'contract/guest/view/:id',
				component: ViewRenterComponent,
			},
			// check in
			{
				path: 'contract/guest/checkin',
				component: ListRenterComponent,
				data: {
					name:"checkin",
					title:"Check In"
				},
			},
			{
				path: 'contract/guest/checkin/add',
				component: AddRenterComponent,
				data: {
					name:"checkin",
					title:"Check In"
				}
			},
			{
				path: 'contract/guest/checkin/edit/:id',
				component: EditRenterComponent,
				data: {
					name:"checkin",
					title:"Check In"
				},
			},
			{
				path: 'contract/guest/checkin/view/:id',
				component: ViewRenterComponent,
				data: {
					name:"checkin",
					title:"Check In"
				},
			},
			// check in

			// check out
			{
				path: 'contract/guest/checkout',
				component: ListRenterCheckOutComponent,
				data: {
					name:"checkout",
					title:"Check Out"
				},
			},
			{
				path: 'contract/guest/checkout/edit/:id',
				component: EditRenterComponent,
				data: {
					name:"checkout",
					title:"Check Out"
				},
			},
			{
				path: 'contract/guest/checkout/view/:id',
				component: ViewRenterComponent,
				data: {
					name:"checkout",
					title:"Check Out"
				},
			},
			// check out

			{
				path: 'contract/ownership',
				component: ListOwnershipComponent

			},
			{
				path: 'contract/ownership/add',
				component: AddOwnershipComponent
			},
			{
				path: 'contract/ownership/edit/:id',
				component: EditOwnershipComponent
			},
			{
				path: 'contract/ownership/view/:id',
				component: ViewOwnershipComponent
			},
			{
				path: 'contract/pp',
				component: ListPinjamPakaiComponent
			},
			{
				path: 'contract/pp/add',
				component: AddPinjamPakaiComponent
			},
			{
				path: 'contract/pp/edit/:id',
				component: EditPinjamPakaiComponent
			},
			{
				path: 'contract/pp/view/:id',
				component: ViewPinjamPakaiComponent
			},
		]
	},
];
@NgModule({
	imports: [
		CommonModule,
		HttpClientModule,
		PartialsModule,
		RouterModule.forChild(routes),
		StoreModule.forFeature('rentercontract', rentercontractReducer),
		StoreModule.forFeature('ownershipcontract', ownershipcontractReducer),
		StoreModule.forFeature('pinjamPakai', pinjamPakaiReducer),
		//StoreModule.forFeature('powerTransaction', powertransactionReducer),
		EffectsModule.forFeature([RenterContractEffect, OwnershipContractEffect, PinjamPakaiEffect]),
		//EffectsModule.forFeature([RenterContractEffect, PowerMeterEffect, PowerTransactionEffect]),
		FormsModule,
		ReactiveFormsModule,
		TranslateModule.forChild(),
		MatButtonModule,
		MatMenuModule,
		MatSelectModule,
		MatInputModule,
		MatTableModule,
		MatAutocompleteModule,
		MatRadioModule,
		MatIconModule,
		MatNativeDateModule,
		MatProgressBarModule,
		MatDatepickerModule,
		MatCardModule,
		MatPaginatorModule,
		MatSortModule,
		MatCheckboxModule,
		MatProgressSpinnerModule,
		MatSnackBarModule,
		MatExpansionModule,
		MatTabsModule,
		MatTooltipModule,
		MatDialogModule,
	],
	providers: [
		InterceptService,
		{
			provide: HTTP_INTERCEPTORS,
			useClass: InterceptService,
			multi: true
		},
		{
			provide: MAT_DIALOG_DEFAULT_OPTIONS,
			useValue: {
				hasBackdrop: true,
				panelClass: 'kt-mat-dialog-container__wrapper',
				height: 'auto',
				width: '900px'
			}
		},
		HttpUtilsService,
		TypesUtilsService,
		LayoutUtilsService
	],
	entryComponents: [
		ActionNotificationComponent,
		ContractComponent,
		PopupPurchaseRequest
	],
	declarations: [
		ContractComponent,
		ListRenterComponent,
		ListRenterCheckOutComponent,
		AddRenterComponent,
		EditRenterComponent,
		ViewRenterComponent,
		RenterComponent,
		OwnershipComponent,
		ListOwnershipComponent,
		AddOwnershipComponent,
		EditOwnershipComponent,
		ViewOwnershipComponent,
		ListPinjamPakaiComponent,
		PinjamPakaiComponent,
		AddPinjamPakaiComponent,
		EditPinjamPakaiComponent,
		ViewPinjamPakaiComponent,
		PopupPurchaseRequest
	]
})
export class ContractModule { }
