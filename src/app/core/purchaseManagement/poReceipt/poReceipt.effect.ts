import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
import { QueryResultsModel } from '../../_base/crud';
import { PoReceiptService } from './poReceipt.service';
import { AppState } from '../../reducers';
import {
	PoReceiptActionTypes,
	PoReceiptPageRequested,
	PoReceiptPageLoaded,
	PoReceiptCreated,
	PoReceiptDeleted,
	PoReceiptUpdated,
	PoReceiptOnServerCreated,
	PoReceiptActionToggleLoading,
	PoReceiptPageToggleLoading
} from './poReceipt.action';
import { QueryPoReceiptModel } from './querypoReceipt.model';


@Injectable()
export class PoReceiptEffect {
	showPageLoadingDistpatcher = new PoReceiptPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new PoReceiptPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new PoReceiptActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new PoReceiptActionToggleLoading({ isLoading: false });

	@Effect()
	loadPoReceiptPage$ = this.actions$
		.pipe(
			ofType<PoReceiptPageRequested>(PoReceiptActionTypes.PoReceiptPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.poReceipt.getListPoReceipt(payload.page)
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
				const lastQuery: QueryPoReceiptModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new PoReceiptPageLoaded({
					poReceipt: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new PoReceiptPageLoaded({
						poReceipt: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deletePoReceipt$ = this.actions$
		.pipe(
			ofType<PoReceiptDeleted>(PoReceiptActionTypes.PoReceiptDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.poReceipt.deletePoReceipt(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updatePoReceipt = this.actions$
		.pipe(
			ofType<PoReceiptUpdated>(PoReceiptActionTypes.PoReceiptUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.poReceipt.updatePoReceipt(payload.poReceipt._id, payload.poReceipt);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<PoReceiptOnServerCreated>(PoReceiptActionTypes.PoReceiptOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.poReceipt.createPoReceipt(payload.poReceipt).pipe(
					tap(res => {
						this.store.dispatch(new PoReceiptCreated({ poReceipt: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private poReceipt: PoReceiptService, private store: Store<AppState>) { }
}
