import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
import { QueryResultsModel } from '../../../_base/crud';
import { BillComService } from './billCom.service';
import { AppState } from '../../../../core/reducers';
import {
	BillComActionTypes,
	BillComPageRequested,
	BillComPageLoaded,
	BillComCreated,
	BillComDeleted,
	BillComUpdated,
	BillComOnServerCreated,
	BillComActionToggleLoading,
	BillComPageToggleLoading
} from './billCom.action';
import { QueryBillComModel } from './querybillCom.model';


@Injectable()
export class BillComEffect {
	showPageLoadingDistpatcher = new BillComPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new BillComPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new BillComActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new BillComActionToggleLoading({ isLoading: false });

	@Effect()
	loadBillComPage$ = this.actions$
		.pipe(
			ofType<BillComPageRequested>(BillComActionTypes.BillComPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.billCom.getListBillCom(payload.page)
				.pipe(
					catchError (err =>{
						return throwError(err);
					}),
					catchError(err => {
						return of (err)
					})
				);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map((response : any ) => {
				const lastQuery: QueryBillComModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new BillComPageLoaded({
					billCom: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new BillComPageLoaded({
						billCom: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteBillCom$ = this.actions$
		.pipe(
			ofType<BillComDeleted>(BillComActionTypes.BillComDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.billCom.deleteBillCom(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateBillCom = this.actions$
		.pipe(
			ofType<BillComUpdated>(BillComActionTypes.BillComUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.billCom.updateBillCom(payload.billCom);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<BillComOnServerCreated>(BillComActionTypes.BillComOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.billCom.createBillCom(payload.billCom).pipe(
					tap(res => {
						this.store.dispatch(new BillComCreated({ billCom: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private billCom: BillComService, private store: Store<AppState>) { }
}
