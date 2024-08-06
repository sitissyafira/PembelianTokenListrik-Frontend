// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap } from 'rxjs/operators';
import { Observable, defer, of, forkJoin } from 'rxjs';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store, select, Action } from '@ngrx/store';
// CRUD
import { QueryResultsModel, QueryParamsModel } from '../_base/crud';
// Services
import { BlockGroupService } from './blockgroup.service';
// State
import { AppState } from '../../core/reducers';
import {
	BlockGroupActionTypes,
	BlockGroupPageRequested,
	BlockGroupPageLoaded,
	BlockGroupCreated,
	BlockGroupDeleted,
	BlockGroupUpdated,
	BlockGroupOnServerCreated,
	BlockGroupActionToggleLoading,
	BlockGroupPageToggleLoading, BlockGroupRequested, BlockGroupLoaded
} from './blockgroup.action';

@Injectable()
export class BlockGroupEffect {
	showPageLoadingDistpatcher = new BlockGroupPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new BlockGroupPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new BlockGroupActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new BlockGroupActionToggleLoading({ isLoading: false });

	@Effect()
	loadBlockGroup$ = this.actions$.pipe(
		ofType<BlockGroupRequested>(BlockGroupActionTypes.AllBlockGroupRequested),
		mergeMap(( { payload } ) => {
			this.store.dispatch(this.showPageLoadingDistpatcher);
			const requestToServer = this.blockgroup.getListBlockGroup(payload.page);
			const lastQuery = of(payload.page);
			return forkJoin(requestToServer, lastQuery);
		}),
		map(response => {
			let res: { errorMessage: string; totalCount: any; items: any };
			const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: '', data: []};
			const lastQuery: QueryParamsModel = response[1];
			return new BlockGroupLoaded({
				blockgroup: result.items,
			});
		})
	);
	@Effect()
	loadUsersPage$ = this.actions$
		.pipe(
			ofType<BlockGroupPageRequested>(BlockGroupActionTypes.BlockGroupPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.blockgroup.getListBlockGroup(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: '', data: []};
				const lastQuery: QueryParamsModel = response[1];
				return new BlockGroupPageLoaded({
					blockgroup: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteUser$ = this.actions$
		.pipe(
			ofType<BlockGroupDeleted>(BlockGroupActionTypes.BlockGroupDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.blockgroup.deleteBlockGroup(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateUser$ = this.actions$
		.pipe(
			ofType<BlockGroupUpdated>(BlockGroupActionTypes.BlockGroupUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.blockgroup.updateBlockGroup(payload.blockgroup);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createUser$ = this.actions$
		.pipe(
			ofType<BlockGroupOnServerCreated>(BlockGroupActionTypes.BlockGroupOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.blockgroup.createBlockGroup(payload.blockgroup).pipe(
					tap(res => {
						this.store.dispatch(new BlockGroupCreated({ blockgroup: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private blockgroup: BlockGroupService, private store: Store<AppState>) { }
}
