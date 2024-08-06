// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap } from 'rxjs/operators';
import { Observable, defer, of, forkJoin } from 'rxjs';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store, select, Action } from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../_base/crud';
// Services
import { ImportpaymentService } from './importpayment.service';
// State
import { AppState } from '../reducers';
import {
	ImportpaymentActionTypes,
	ImportpaymentPageRequested,
	ImportpaymentPageLoaded,
	ImportpaymentCreated,
	ImportpaymentDeleted,
	ImportpaymentUpdated,
	ImportpaymentOnServerCreated,
	ImportpaymentActionToggleLoading,
	ImportpaymentPageToggleLoading
} from './importpayment.action';
import { QueryImportpaymentModel } from './queryimportpayment.model';


@Injectable()
export class ImportpaymentEffect {
	showPageLoadingDistpatcher = new ImportpaymentPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new ImportpaymentPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new ImportpaymentActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new ImportpaymentActionToggleLoading({ isLoading: false });

	@Effect()
	loadRentalbillingPage$ = this.actions$
		.pipe(
			ofType<ImportpaymentPageRequested>(ImportpaymentActionTypes.ImportpaymentPageRequested),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.importpayment.getListPaidImport(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),

			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryImportpaymentModel = response[1];
				return new ImportpaymentPageLoaded({
					importpayment: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteRentalbilling$ = this.actions$
		.pipe(
			ofType<ImportpaymentDeleted>(ImportpaymentActionTypes.ImportpaymentDeleted),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.importpayment.deleteRentalbilling(payload.id);
			}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateRentalbilling = this.actions$
		.pipe(
			ofType<ImportpaymentUpdated>(ImportpaymentActionTypes.ImportpaymentUpdated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.importpayment.updateRentalbilling(payload.importpayment);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<ImportpaymentOnServerCreated>(ImportpaymentActionTypes.ImportpaymentOnServerCreated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.importpayment.createRentalbilling(payload.importpayment).pipe(
					tap(res => {
						this.store.dispatch(new ImportpaymentCreated({ importpayment: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private importpayment: ImportpaymentService, private store: Store<AppState>) { }
}
