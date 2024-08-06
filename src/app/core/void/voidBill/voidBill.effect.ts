// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../../_base/crud';
// Services
import { VoidBillService } from './voidBill.service';
// State
import { AppState } from '../../../core/reducers';
import {
	VoidBillActionTypes,
	VoidBillPageRequested,
	VoidBillPageLoaded,
	VoidBillCreated,
	VoidBillDeleted,
	VoidBillUpdated,
	VoidBillOnServerCreated,
	VoidBillActionToggleLoading,
	VoidBillPageToggleLoading
} from './voidBill.action';
import { QueryVoidBillModel } from './queryvoidBill.model';

@Injectable()
export class VoidBillEffect {
	showPageLoadingDistpatcher = new VoidBillPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new VoidBillPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new VoidBillActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new VoidBillActionToggleLoading({ isLoading: false });

	@Effect()
	loadVoidBillPage$ = this.actions$
		.pipe(
			ofType<VoidBillPageRequested>(VoidBillActionTypes.VoidBillPageRequested),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.voidBill.getListVoidBill(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryVoidBillModel = response[1];
				return new VoidBillPageLoaded({
					voidBill: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteVoidBill$ = this.actions$
		.pipe(
			ofType<VoidBillDeleted>(VoidBillActionTypes.VoidBillDeleted),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.voidBill.deleteVoidBill(payload.id);
			}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateVoidBill$ = this.actions$
		.pipe(
			ofType<VoidBillUpdated>(VoidBillActionTypes.VoidBillUpdated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.voidBill.updateVoidBill(payload.voidBill);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createVoidBill$ = this.actions$
		.pipe(
			ofType<VoidBillOnServerCreated>(VoidBillActionTypes.VoidBillOnServerCreated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.voidBill.createVoidBill(payload.voidBill).pipe(
					tap(res => {
						this.store.dispatch(new VoidBillCreated({ voidBill: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private voidBill: VoidBillService, private store: Store<AppState>) { }
}
