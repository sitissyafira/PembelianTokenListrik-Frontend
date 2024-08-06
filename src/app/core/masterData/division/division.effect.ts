import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
import { QueryResultsModel } from '../../_base/crud';
import { DivisionService } from './division.service';
import { AppState } from '../../../core/reducers';
import {
	DivisionActionTypes,
	DivisionPageRequested,
	DivisionPageLoaded,
	DivisionCreated,
	DivisionDeleted,
	DivisionUpdated,
	DivisionOnServerCreated,
	DivisionActionToggleLoading,
	DivisionPageToggleLoading
} from './division.action';
import { QueryDivisionModel } from './querydivision.model';


@Injectable()
export class DivisionEffect {
	showPageLoadingDistpatcher = new DivisionPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new DivisionPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new DivisionActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new DivisionActionToggleLoading({ isLoading: false });

	@Effect()
	loadDivisionPage$ = this.actions$
		.pipe(
			ofType<DivisionPageRequested>(DivisionActionTypes.DivisionPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.division.getListDivision(payload.page)
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
				const lastQuery: QueryDivisionModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new DivisionPageLoaded({
					division: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new DivisionPageLoaded({
						division: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteDivision$ = this.actions$
		.pipe(
			ofType<DivisionDeleted>(DivisionActionTypes.DivisionDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.division.deleteDivision(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateDivision = this.actions$
		.pipe(
			ofType<DivisionUpdated>(DivisionActionTypes.DivisionUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.division.updateDivision(payload.division);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<DivisionOnServerCreated>(DivisionActionTypes.DivisionOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.division.createDivision(payload.division).pipe(
					tap(res => {
						this.store.dispatch(new DivisionCreated({ division: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private division: DivisionService, private store: Store<AppState>) { }
}
