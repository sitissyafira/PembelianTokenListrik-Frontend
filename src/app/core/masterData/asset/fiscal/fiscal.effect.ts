// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap } from 'rxjs/operators';
import { Observable, defer, of, forkJoin } from 'rxjs';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store, select, Action } from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../../../_base/crud';
// Services
import { FiscalService } from './fiscal.service';
// State
import { AppState } from '../../../../core/reducers';
import {
	FiscalActionTypes,
	FiscalPageRequested,
	FiscalPageLoaded,
	FiscalCreated,
	FiscalDeleted,
	FiscalUpdated,
	FiscalOnServerCreated,
	FiscalActionToggleLoading,
	FiscalPageToggleLoading
} from './fiscal.action';
import { QueryFiscalModel } from './queryfiscal.model';


@Injectable()
export class FiscalEffect {
	showPageLoadingDistpatcher = new FiscalPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new FiscalPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new FiscalActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new FiscalActionToggleLoading({ isLoading: false });

	@Effect()
	loadFiscalPage$ = this.actions$
		.pipe(
			ofType<FiscalPageRequested>(FiscalActionTypes.FiscalPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.fiscal.getListFiscal(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryFiscalModel = response[1];
				return new FiscalPageLoaded({
					fiscal: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteFiscal$ = this.actions$
		.pipe(
			ofType<FiscalDeleted>(FiscalActionTypes.FiscalDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.fiscal.deleteFiscal(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateFiscal = this.actions$
		.pipe(
			ofType<FiscalUpdated>(FiscalActionTypes.FiscalUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.fiscal.updateFiscal(payload.fiscal);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<FiscalOnServerCreated>(FiscalActionTypes.FiscalOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.fiscal.createFiscal(payload.fiscal).pipe(
					tap(res => {
						this.store.dispatch(new FiscalCreated({ fiscal: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private fiscal: FiscalService, private store: Store<AppState>) { }
}
