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
import { ApplicationService } from './application.service';
// State
import { AppState } from '../../core/reducers';
import {
	ApplicationActionTypes,
	ApplicationPageRequested,
	ApplicationPageLoaded,
	ApplicationCreated,
	ApplicationDeleted,
	ApplicationUpdated,
	ApplicationOnServerCreated,
	ApplicationActionToggleLoading,
	ApplicationPageToggleLoading
} from './application.action';
import { QueryApplicationModel } from './queryapplication.model';


@Injectable()
export class ApplicationEffect {
	showPageLoadingDistpatcher = new ApplicationPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new ApplicationPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new ApplicationActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new ApplicationActionToggleLoading({ isLoading: false });

	@Effect()
	loadApplicationPage$ = this.actions$
		.pipe(
			ofType<ApplicationPageRequested>(ApplicationActionTypes.ApplicationPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.application.getListApplication(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryApplicationModel = response[1];
				return new ApplicationPageLoaded({
					application: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteApplication$ = this.actions$
		.pipe(
			ofType<ApplicationDeleted>(ApplicationActionTypes.ApplicationDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.application.deleteApplication(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateApplication = this.actions$
		.pipe(
			ofType<ApplicationUpdated>(ApplicationActionTypes.ApplicationUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.application.updateApplication(payload.application);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<ApplicationOnServerCreated>(ApplicationActionTypes.ApplicationOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.application.createApplication(payload.application).pipe(
					tap(res => {
						this.store.dispatch(new ApplicationCreated({ application: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private application: ApplicationService, private store: Store<AppState>) { }
}
