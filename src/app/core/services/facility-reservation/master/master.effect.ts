// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { Observable, defer, of, forkJoin, throwError } from 'rxjs';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store, select, Action } from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../../../_base/crud';
// Services
import { MasterService } from './master.service';
// State
import { AppState } from '../../../reducers';
import {
	MasterActionTypes,
	MasterPageRequested,
	MasterPageLoaded,
	MasterCreated,
	MasterDeleted,
	MasterUpdated,
	MasterOnServerCreated,
	MasterActionToggleLoading,
	MasterPageToggleLoading,
} from './master.action';
import { QueryMasterModel } from './querymaster.model';


@Injectable()
export class MasterEffect {
	showPageLoadingDistpatcher = new MasterPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new MasterPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new MasterActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new MasterActionToggleLoading({ isLoading: false });

	@Effect()
	loadMasterPage$ = this.actions$
		.pipe(
			ofType<MasterPageRequested>(MasterActionTypes.MasterPageRequested),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.master.getListMaster(payload.page)
					.pipe(
						catchError(err => {
							return throwError(err);
						}),
						catchError(err => {
							return of(err)
						})
					);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map((response: any) => {
				const lastQuery: QueryMasterModel = response[1];

				// if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };

				return new MasterPageLoaded({
					master: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
				// }else {
				// 	const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
				// 		return new MasterPageLoaded({
				// 			master: result.items,
				// 			totalCount: result.totalCount,
				// 			page: lastQuery
				// 		});
				// 	}
			}),
		);

	@Effect()
	deleteMaster$ = this.actions$
		.pipe(
			ofType<MasterDeleted>(MasterActionTypes.MasterDeleted),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.master.deleteMaster(payload.id);
			}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateMaster = this.actions$
		.pipe(
			ofType<MasterUpdated>(MasterActionTypes.MasterUpdated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.master.updateMaster(payload.master);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);
	@Effect()
	createMaster$ = this.actions$
		.pipe(
			ofType<MasterOnServerCreated>(MasterActionTypes.MasterOnServerCreated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.master.createMaster(payload.master).pipe(
					tap(res => {
						this.store.dispatch(new MasterCreated({ master: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private master: MasterService, private store: Store<AppState>) { }
}
