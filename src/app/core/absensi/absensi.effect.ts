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
import { AbsensiService } from './absensi.service';
// State
import { AppState } from '../reducers';
import {
	AbsensiActionTypes,
	AbsensiPageRequested,
	AbsensiPageLoaded,
	AbsensiCreated,
	AbsensiDeleted,
	AbsensiUpdated,
	AbsensiOnServerCreated,
	AbsensiActionToggleLoading,
	AbsensiPageToggleLoading
} from './absensi.action';
import { QueryAbsensiModel } from './queryabsensi.model';

@Injectable()
export class AbsensiEffect {
	showPageLoadingDistpatcher = new AbsensiPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new AbsensiPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new AbsensiActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new AbsensiActionToggleLoading({ isLoading: false });

	@Effect()
	loadAbsensiPage$ = this.actions$
		.pipe(
			ofType<AbsensiPageRequested>(AbsensiActionTypes.AbsensiPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.absensi.getListAbsensi(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryAbsensiModel = response[1];
				return new AbsensiPageLoaded({
					absensi: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteAbsensi$ = this.actions$
		.pipe(
			ofType<AbsensiDeleted>(AbsensiActionTypes.AbsensiDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.absensi.deleteAbsensi(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateAbsensi = this.actions$
		.pipe(
			ofType<AbsensiUpdated>(AbsensiActionTypes.AbsensiUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.absensi.updateAbsensi(payload.absensi);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createAbsensi$ = this.actions$
		.pipe(
			ofType<AbsensiOnServerCreated>(AbsensiActionTypes.AbsensiOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.absensi.createAbsensi(payload.absensi).pipe(
					tap(res => {
						this.store.dispatch(new AbsensiCreated({ absensi: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private absensi: AbsensiService, private store: Store<AppState>) { }
}
