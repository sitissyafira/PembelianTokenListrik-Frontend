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
import { AdService } from './ad.service';
// State
import { AppState } from '../../../core/reducers';
import {
	AdActionTypes,
	AdPageRequested,
	AdPageLoaded,
	AdCreated,
	AdDeleted,
	AdUpdated,
	AdOnServerCreated,
	AdActionToggleLoading,
	AdPageToggleLoading
} from './ad.action';
import { QueryAdModel } from './queryad.model';


@Injectable()
export class AdEffect {
	showPageLoadingDistpatcher = new AdPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new AdPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new AdActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new AdActionToggleLoading({ isLoading: false });

	@Effect()
	loadAdPage$ = this.actions$
		.pipe(
			ofType<AdPageRequested>(AdActionTypes.AdPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.ad.getListAd(payload.page)
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
			map((response : any )=> {
				// let res: { errorMessage: string; totalCount: any; items: any };
				const lastQuery: QueryAdModel = response[1];
				if(response[0].status && response[0].status === "success"){
					const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
					return new AdPageLoaded({
						ad: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}else{
					const result: QueryResultsModel = {items: [], totalCount: response[0].totalCount, errorMessage: "", data:[] };
					return new AdPageLoaded({
						ad: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteAd$ = this.actions$
		.pipe(
			ofType<AdDeleted>(AdActionTypes.AdDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.ad.deleteAd(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateAd = this.actions$
		.pipe(
			ofType<AdUpdated>(AdActionTypes.AdUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.ad.updateAd(payload.ad);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<AdOnServerCreated>(AdActionTypes.AdOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.ad.createAd(payload.ad).pipe(
					tap(res => {
						this.store.dispatch(new AdCreated({ ad: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private ad: AdService, private store: Store<AppState>) { }
}
