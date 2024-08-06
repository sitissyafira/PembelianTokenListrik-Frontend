import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
import { QueryResultsModel } from '../../_base/crud';
import { CheckpointService } from './checkpoint.service';
import { AppState } from '../../reducers';
import {
	CheckpointActionTypes,
	CheckpointPageRequested,
	CheckpointPageLoaded,
	CheckpointCreated,
	CheckpointDeleted,
	CheckpointUpdated,
	CheckpointOnServerCreated,
	CheckpointActionToggleLoading,
	CheckpointPageToggleLoading
} from './checkpoint.action';
import { QueryCheckpointModel } from './querycheckpoint.model';


@Injectable()
export class CheckpointEffect {
	showPageLoadingDistpatcher = new CheckpointPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new CheckpointPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new CheckpointActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new CheckpointActionToggleLoading({ isLoading: false });

	@Effect()
	loadCheckpointPage$ = this.actions$
		.pipe(
			ofType<CheckpointPageRequested>(CheckpointActionTypes.CheckpointPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.checkpoint.getListCheckpoint(payload.page)
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
				const lastQuery: QueryCheckpointModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new CheckpointPageLoaded({
					checkpoint: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new CheckpointPageLoaded({
						checkpoint: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteCheckpoint$ = this.actions$
		.pipe(
			ofType<CheckpointDeleted>(CheckpointActionTypes.CheckpointDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.checkpoint.deleteCheckpoint(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateCheckpoint = this.actions$
		.pipe(
			ofType<CheckpointUpdated>(CheckpointActionTypes.CheckpointUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.checkpoint.updateCheckpoint(payload.checkpoint);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<CheckpointOnServerCreated>(CheckpointActionTypes.CheckpointOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.checkpoint.createCheckpoint(payload.checkpoint).pipe(
					tap(res => {
						this.store.dispatch(new CheckpointCreated({ checkpoint: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private checkpoint: CheckpointService, private store: Store<AppState>) { }
}
