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
import { AddparkService } from './addpark.service';
// State
import { AppState } from '../../core/reducers';
import {
	AddparkActionTypes,
	AddparkPageRequested,
	AddparkPageLoaded,
	AddparkCreated,
	AddparkDeleted,
	AddparkUpdated,
	AddparkOnServerCreated,
	AddparkActionToggleLoading,
	AddparkPageToggleLoading
} from './addpark.action';
import { QueryAddparkModel } from './queryaddpark.model';


@Injectable()
export class AddparkEffect {
	showPageLoadingDistpatcher = new AddparkPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new AddparkPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new AddparkActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new AddparkActionToggleLoading({ isLoading: false });

	@Effect()
	loadAddparkPage$ = this.actions$
		.pipe(
			ofType<AddparkPageRequested>(AddparkActionTypes.AddparkPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.addpark.getListAddpark(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryAddparkModel = response[1];
				return new AddparkPageLoaded({
					addpark: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteAddpark$ = this.actions$
		.pipe(
			ofType<AddparkDeleted>(AddparkActionTypes.AddparkDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.addpark.deleteAddpark(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateAddpark = this.actions$
		.pipe(
			ofType<AddparkUpdated>(AddparkActionTypes.AddparkUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.addpark.updateAddpark(payload.addpark);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<AddparkOnServerCreated>(AddparkActionTypes.AddparkOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.addpark.createAddpark(payload.addpark).pipe(
					tap(res => {
						this.store.dispatch(new AddparkCreated({ addpark: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private addpark: AddparkService, private store: Store<AppState>) { }
}
