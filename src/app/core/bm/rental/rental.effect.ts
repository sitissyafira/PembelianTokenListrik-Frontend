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
import { RentalService } from './rental.service';
// State
import { AppState } from '../../../core/reducers';
import {
	RentalActionTypes,
	RentalPageRequested,
	RentalPageLoaded,
	RentalCreated,
	RentalDeleted,
	RentalUpdated,
	RentalOnServerCreated,
	RentalActionToggleLoading,
	RentalPageToggleLoading
} from './rental.action';
import { QueryRentalModel } from './queryrental.model';


@Injectable()
export class RentalEffect {
	showPageLoadingDistpatcher = new RentalPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new RentalPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new RentalActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new RentalActionToggleLoading({ isLoading: false });

	@Effect()
	loadRentalPage$ = this.actions$
		.pipe(
			ofType<RentalPageRequested>(RentalActionTypes.RentalPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.rental.getListRental(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryRentalModel = response[1];
				return new RentalPageLoaded({
					rental: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteRental$ = this.actions$
		.pipe(
			ofType<RentalDeleted>(RentalActionTypes.RentalDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.rental.deleteRental(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateRental = this.actions$
		.pipe(
			ofType<RentalUpdated>(RentalActionTypes.RentalUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.rental.updateRental(payload.rental);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<RentalOnServerCreated>(RentalActionTypes.RentalOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.rental.createRental(payload.rental).pipe(
					tap(res => {
						this.store.dispatch(new RentalCreated({ rental: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private rental: RentalService, private store: Store<AppState>) { }
}
