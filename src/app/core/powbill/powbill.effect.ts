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
import { PowbillService } from './powbill.service';
// State
import { AppState } from '../../core/reducers';
import {
	PowbillActionTypes,
	PowbillPageRequested,
	PowbillPageLoaded,
	PowbillCreated,
	PowbillDeleted,
	PowbillUpdated,
	PowbillOnServerCreated,
	PowbillActionToggleLoading,
	PowbillPageToggleLoading
} from './powbill.action';
import { QueryPowbillModel } from './querypowbill.model';


@Injectable()
export class PowbillEffect {
	showPageLoadingDistpatcher = new PowbillPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new PowbillPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new PowbillActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new PowbillActionToggleLoading({ isLoading: false });

	@Effect()
	loadPowbillPage$ = this.actions$
		.pipe(
			ofType<PowbillPageRequested>(PowbillActionTypes.PowbillPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.powbill.getListPowbill(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryPowbillModel = response[1];
				return new PowbillPageLoaded({
					powbill: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deletePowbill$ = this.actions$
		.pipe(
			ofType<PowbillDeleted>(PowbillActionTypes.PowbillDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.powbill.deletePowbill(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updatePowbill = this.actions$
		.pipe(
			ofType<PowbillUpdated>(PowbillActionTypes.PowbillUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.powbill.updatePowbill(payload.powbill);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<PowbillOnServerCreated>(PowbillActionTypes.PowbillOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.powbill.createPowbill(payload.powbill).pipe(
					tap(res => {
						this.store.dispatch(new PowbillCreated({ powbill: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private powbill: PowbillService, private store: Store<AppState>) { }
}
