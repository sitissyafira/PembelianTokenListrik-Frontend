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
import { ExternalUserService } from './externalUser.service';
// State
import { AppState } from '../reducers';
import {
	ExternalUserActionTypes,
	ExternalUserPageRequested,
	ExternalUserPageLoaded,
	ExternalUserCreated,
	ExternalUserDeleted,
	ExternalUserUpdated,
	ExternalUserOnServerCreated,
	ExternalUserActionToggleLoading,
	ExternalUserPageToggleLoading
} from './externalUser.action';
import { QueryExternalUserModel } from './queryexternalUser.model';

@Injectable()
export class ExternalUserEffect {
	showPageLoadingDistpatcher = new ExternalUserPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new ExternalUserPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new ExternalUserActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new ExternalUserActionToggleLoading({ isLoading: false });

	@Effect()
	loadExternalUserPage$ = this.actions$
		.pipe(
			ofType<ExternalUserPageRequested>(ExternalUserActionTypes.ExternalUserPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.externalUser.getListExternalUser(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryExternalUserModel = response[1];
				return new ExternalUserPageLoaded({
					externalUser: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteExternalUser$ = this.actions$
		.pipe(
			ofType<ExternalUserDeleted>(ExternalUserActionTypes.ExternalUserDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.externalUser.deleteExternalUser(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateExternalUser = this.actions$
		.pipe(
			ofType<ExternalUserUpdated>(ExternalUserActionTypes.ExternalUserUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.externalUser.updateExternalUser(payload.externalUser._id, payload.externalUser);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createExternalUser$ = this.actions$
		.pipe(
			ofType<ExternalUserOnServerCreated>(ExternalUserActionTypes.ExternalUserOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.externalUser.createExternalUser(payload.externalUser).pipe(
					tap(res => {
						this.store.dispatch(new ExternalUserCreated({ externalUser: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private externalUser: ExternalUserService, private store: Store<AppState>) { }
}
