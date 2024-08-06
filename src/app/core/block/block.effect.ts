// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../_base/crud';
// Services
import { BlockService } from './block.service';
// State
import { AppState } from '../../core/reducers';
import {
	BlockActionTypes,
	BlockPageRequested,
	BlockPageLoaded,
	BlockCreated,
	BlockDeleted,
	BlockUpdated,
	BlockOnServerCreated,
	BlockActionToggleLoading,
	BlockPageToggleLoading
} from './block.action';
import {QueryBlockModel} from './queryblock.model';

@Injectable()
export class BlockEffect {
	showPageLoadingDistpatcher = new BlockPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new BlockPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new BlockActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new BlockActionToggleLoading({ isLoading: false });

	@Effect()
	loadBlockPage$ = this.actions$
		.pipe(
			ofType<BlockPageRequested>(BlockActionTypes.BlockPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.block.getListBlock(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryBlockModel = response[1];
				return new BlockPageLoaded({
					block: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteBlock$ = this.actions$
		.pipe(
			ofType<BlockDeleted>(BlockActionTypes.BlockDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.block.deleteBlock(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateBlock$ = this.actions$
		.pipe(
			ofType<BlockUpdated>(BlockActionTypes.BlockUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.block.updateBlock(payload.block);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<BlockOnServerCreated>(BlockActionTypes.BlockOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.block.createBlock(payload.block).pipe(
					tap(res => {
						this.store.dispatch(new BlockCreated({ block: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private block: BlockService, private store: Store<AppState>) { }
}
