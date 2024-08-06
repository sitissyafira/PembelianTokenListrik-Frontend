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
import { RoleService } from './role.service';
// State
import { AppState } from '../../core/reducers';
import {
	RoleActionTypes,
	RolePageRequested,
	RolePageLoaded,
	RoleCreated,
	RoleDeleted,
	RoleUpdated,
	RoleOnServerCreated,
	RoleActionToggleLoading,
	RolePageToggleLoading
} from './role.action';
import { QueryRoleModel } from './queryrole.model';


@Injectable()
export class RoleEffect {
	showPageLoadingDistpatcher = new RolePageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new RolePageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new RoleActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new RoleActionToggleLoading({ isLoading: false });

	@Effect()
	loadRolePage$ = this.actions$
		.pipe(
			ofType<RolePageRequested>(RoleActionTypes.RolePageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.role.getListRole(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryRoleModel = response[1];
				return new RolePageLoaded({
					role: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteRole$ = this.actions$
		.pipe(
			ofType<RoleDeleted>(RoleActionTypes.RoleDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.role.deleteRole(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateRole = this.actions$
		.pipe(
			ofType<RoleUpdated>(RoleActionTypes.RoleUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.role.updateRole(payload.role);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<RoleOnServerCreated>(RoleActionTypes.RoleOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.role.createRole(payload.role).pipe(
					tap(res => {
						this.store.dispatch(new RoleCreated({ role: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private role: RoleService, private store: Store<AppState>) { }
}
