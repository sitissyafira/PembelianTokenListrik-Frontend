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
import { EngineerService } from './engineer.service';
// State
import { AppState } from '../reducers';
import {
	EngineerActionTypes,
	EngineerPageRequested,
	EngineerPageLoaded,
	EngineerCreated,
	EngineerDeleted,
	EngineerUpdated,
	EngineerOnServerCreated,
	EngineerActionToggleLoading,
	EngineerPageToggleLoading
} from './engineer.action';
import {QueryEngineerModel} from './queryengineer.model';

@Injectable()
export class EngineerEffect {
	showPageLoadingDistpatcher = new EngineerPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new EngineerPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new EngineerActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new EngineerActionToggleLoading({ isLoading: false });

	@Effect()
	loadEngineerPage$ = this.actions$
		.pipe(
			ofType<EngineerPageRequested>(EngineerActionTypes.EngineerPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.engineer.getListEngineer(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryEngineerModel = response[1];
				return new EngineerPageLoaded({
					engineer: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);
		
	@Effect()
	deleteEngineer$ = this.actions$
		.pipe(
			ofType<EngineerDeleted>(EngineerActionTypes.EngineerDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.engineer.deleteEngineer(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateEngineer = this.actions$
		.pipe(
			ofType<EngineerUpdated>(EngineerActionTypes.EngineerUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.engineer.updateEngineer(payload.engineer._id, payload.engineer);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createEngineer$ = this.actions$
		.pipe(
			ofType<EngineerOnServerCreated>(EngineerActionTypes.EngineerOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.engineer.createEngineer(payload.engineer).pipe(
					tap(res => {
						this.store.dispatch(new EngineerCreated({ engineer: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private engineer: EngineerService, private store: Store<AppState>) { }
}
