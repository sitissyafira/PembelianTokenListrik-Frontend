import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import {  of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { QueryResultsModel } from '../../../_base/crud';
import { BillLogService } from './billLog.service';
import { AppState } from '../../../../core/reducers';
import {
	BillLogActionTypes,
	BillLogPageRequested,
	BillLogPageLoaded,
	BillLogCreated,
	BillLogDeleted,
	BillLogUpdated,
	BillLogOnServerCreated,
	BillLogActionToggleLoading,
	BillLogPageToggleLoading
} from './billLog.action';
import { QueryBillLogModel } from './querybillLog.model';


@Injectable()
export class BillLogEffect {
	showPageLoadingDistpatcher = new BillLogPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new BillLogPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new BillLogActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new BillLogActionToggleLoading({ isLoading: false });

	@Effect()
	loadBillLogPage$ = this.actions$
		.pipe(
			ofType<BillLogPageRequested>(BillLogActionTypes.BillLogPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.billLog.getListBillLog(payload.page)
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
				const lastQuery: QueryBillLogModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new BillLogPageLoaded({
					billLog: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new BillLogPageLoaded({
						billLog: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteBillLog$ = this.actions$
		.pipe(
			ofType<BillLogDeleted>(BillLogActionTypes.BillLogDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.billLog.deleteBillLog(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateBillLog = this.actions$
		.pipe(
			ofType<BillLogUpdated>(BillLogActionTypes.BillLogUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.billLog.updateBillLog(payload.billLog);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<BillLogOnServerCreated>(BillLogActionTypes.BillLogOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.billLog.createBillLog(payload.billLog).pipe(
					tap(res => {
						this.store.dispatch(new BillLogCreated({ billLog: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private billLog: BillLogService, private store: Store<AppState>) { }
}
