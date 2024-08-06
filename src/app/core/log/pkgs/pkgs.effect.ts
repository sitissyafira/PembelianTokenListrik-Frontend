// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { Observable, defer, of, forkJoin, throwError } from 'rxjs';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store, select, Action } from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../../_base/crud';
// Services
import { PkgsService } from './pkgs.service';
// State
import { AppState } from '../../../core/reducers';
import {
	PkgsActionTypes,
	PkgsPageRequested,
	PkgsPageLoaded,
	PkgsCreated,
	PkgsDeleted,
	PkgsUpdated,
	PkgsOnServerCreated,
	PkgsActionToggleLoading,
	PkgsPageToggleLoading
} from './pkgs.action';
import { QueryPkgsModel } from './querypkgs.model';


@Injectable()
export class PkgsEffect {
	showPageLoadingDistpatcher = new PkgsPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new PkgsPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new PkgsActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new PkgsActionToggleLoading({ isLoading: false });

	@Effect()
	loadPkgsPage$ = this.actions$
		.pipe(
			ofType<PkgsPageRequested>(PkgsActionTypes.PkgsPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.pkgs.getListPkgs(payload.page)
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
				const lastQuery: QueryPkgsModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new PkgsPageLoaded({
					pkgs: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new PkgsPageLoaded({
						pkgs: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deletePkgs$ = this.actions$
		.pipe(
			ofType<PkgsDeleted>(PkgsActionTypes.PkgsDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.pkgs.deletePkgs(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updatePkgs = this.actions$
		.pipe(
			ofType<PkgsUpdated>(PkgsActionTypes.PkgsUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.pkgs.updatePkgs(payload.pkgs);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<PkgsOnServerCreated>(PkgsActionTypes.PkgsOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.pkgs.createPkgs(payload.pkgs).pipe(
					tap(res => {
						this.store.dispatch(new PkgsCreated({ pkgs: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private pkgs: PkgsService, private store: Store<AppState>) { }
}
