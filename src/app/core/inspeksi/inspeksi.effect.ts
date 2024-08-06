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
import { InspeksiService } from './inspeksi.service';
// State
import { AppState } from '../reducers';
import {
	InspeksiActionTypes,
	InspeksiPageRequested,
	InspeksiPageLoaded,
	InspeksiCreated,
	InspeksiDeleted,
	InspeksiUpdated,
	InspeksiOnServerCreated,
	InspeksiActionToggleLoading,
	InspeksiPageToggleLoading
} from './inspeksi.action';
import { QueryInspeksiModel } from './queryinspeksi.model';

@Injectable()
export class InspeksiEffect {
	showPageLoadingDistpatcher = new InspeksiPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new InspeksiPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new InspeksiActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new InspeksiActionToggleLoading({ isLoading: false });

	@Effect()
	loadInspeksiPage$ = this.actions$
		.pipe(
			ofType<InspeksiPageRequested>(InspeksiActionTypes.InspeksiPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.inspeksi.getListInspeksi(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryInspeksiModel = response[1];
				return new InspeksiPageLoaded({
					inspeksi: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteInspeksi$ = this.actions$
		.pipe(
			ofType<InspeksiDeleted>(InspeksiActionTypes.InspeksiDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.inspeksi.deleteInspeksi(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateInspeksi = this.actions$
		.pipe(
			ofType<InspeksiUpdated>(InspeksiActionTypes.InspeksiUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.inspeksi.updateInspeksi(payload.inspeksi);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createInspeksi$ = this.actions$
		.pipe(
			ofType<InspeksiOnServerCreated>(InspeksiActionTypes.InspeksiOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.inspeksi.createInspeksi(payload.inspeksi).pipe(
					tap(res => {
						this.store.dispatch(new InspeksiCreated({ inspeksi: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private inspeksi: InspeksiService, private store: Store<AppState>) { }
}
