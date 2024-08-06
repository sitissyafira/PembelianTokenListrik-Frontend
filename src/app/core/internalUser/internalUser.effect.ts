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
import { InternalUserService } from './internalUser.service';
// State
import { AppState } from '../reducers';
import {
	InternalUserActionTypes,
	InternalUserPageRequested,
	InternalUserPageLoaded,
	InternalUserCreated,
	InternalUserDeleted,
	InternalUserUpdated,
	InternalUserOnServerCreated,
	InternalUserActionToggleLoading,
	InternalUserPageToggleLoading
} from './internalUser.action';
import { QueryInternalUserModel } from './queryinternalUser.model';

@Injectable()
export class InternalUserEffect {
	showPageLoadingDistpatcher = new InternalUserPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new InternalUserPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new InternalUserActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new InternalUserActionToggleLoading({ isLoading: false });

	@Effect()
	loadInternalUserPage$ = this.actions$
		.pipe(
			ofType<InternalUserPageRequested>(InternalUserActionTypes.InternalUserPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.internalUser.getListInternalUser(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryInternalUserModel = response[1];
				return new InternalUserPageLoaded({
					internalUser: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteInternalUser$ = this.actions$
		.pipe(
			ofType<InternalUserDeleted>(InternalUserActionTypes.InternalUserDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.internalUser.deleteInternalUser(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateInternalUser = this.actions$
		.pipe(
			ofType<InternalUserUpdated>(InternalUserActionTypes.InternalUserUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.internalUser.updateInternalUser(payload.internalUser._id, payload.internalUser);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createInternalUser$ = this.actions$
		.pipe(
			ofType<InternalUserOnServerCreated>(InternalUserActionTypes.InternalUserOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.internalUser.createInternalUser(payload.internalUser).pipe(
					tap(res => {
						this.store.dispatch(new InternalUserCreated({ internalUser: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private internalUser: InternalUserService, private store: Store<AppState>) { }
}
