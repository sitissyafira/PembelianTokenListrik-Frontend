// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap } from 'rxjs/operators';
import { Observable, defer, of, forkJoin } from 'rxjs';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store, select, Action } from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../../_base/crud';
// Services
import { ShiftService } from './shift.service';
// State
import { AppState } from '../../reducers';
import {
	ShiftActionTypes,
	ShiftPageRequested,
	ShiftPageLoaded,
	ShiftCreated,
	ShiftDeleted,
	ShiftUpdated,
	ShiftOnServerCreated,
	ShiftActionToggleLoading,
	ShiftPageToggleLoading
} from './shift';
import { QueryShiftModel } from './queryshift.model';

@Injectable()
export class ShiftEffect {
	showPageLoadingDistpatcher = new ShiftPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new ShiftPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new ShiftActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new ShiftActionToggleLoading({ isLoading: false });

	@Effect()
	loadShiftPage$ = this.actions$
		.pipe(
			ofType<ShiftPageRequested>(ShiftActionTypes.ShiftPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.shift.getListShift(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryShiftModel = response[1];
				return new ShiftPageLoaded({
					shift: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteShift$ = this.actions$
		.pipe(
			ofType<ShiftDeleted>(ShiftActionTypes.ShiftDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.shift.deleteShift(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateShift = this.actions$
		.pipe(
			ofType<ShiftUpdated>(ShiftActionTypes.ShiftUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.shift.updateShift(payload.shift);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createShift$ = this.actions$
		.pipe(
			ofType<ShiftOnServerCreated>(ShiftActionTypes.ShiftOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.shift.createShift(payload.shift).pipe(
					tap(res => {
						this.store.dispatch(new ShiftCreated({ shift: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private shift: ShiftService, private store: Store<AppState>) { }
}
