// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../_base/crud';
// Services
import { InvoiceService } from './invoice.service';
// State
import { AppState } from '../../core/reducers';
import {
	InvoiceActionTypes,
	InvoicePageRequested,
	InvoicePageLoaded,
	InvoiceCreated,
	InvoiceDeleted,
	InvoiceUpdated,
	InvoiceOnServerCreated,
	InvoiceActionToggleLoading,
	InvoicePageToggleLoading
} from './invoice.action';
import {QueryInvoiceModel} from './queryinvoice.model';

@Injectable()
export class InvoiceEffect {
	showPageLoadingDistpatcher = new InvoicePageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new InvoicePageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new InvoiceActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new InvoiceActionToggleLoading({ isLoading: false });

	@Effect()
	loadInvoicePage$ = this.actions$
		.pipe(
			ofType<InvoicePageRequested>(InvoiceActionTypes.InvoicePageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.invoice.getListInvoice(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryInvoiceModel = response[1];
				return new InvoicePageLoaded({
					invoice: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteInvoice$ = this.actions$
		.pipe(
			ofType<InvoiceDeleted>(InvoiceActionTypes.InvoiceDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.invoice.deleteInvoice(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateInvoice$ = this.actions$
		.pipe(
			ofType<InvoiceUpdated>(InvoiceActionTypes.InvoiceUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.invoice.updateInvoice(payload.invoice);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createInvoice$ = this.actions$
		.pipe(
			ofType<InvoiceOnServerCreated>(InvoiceActionTypes.InvoiceOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.invoice.createInvoice(payload.invoice).pipe(
					tap(res => {
						this.store.dispatch(new InvoiceCreated({ invoice: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private invoice: InvoiceService, private store: Store<AppState>) { }
}
