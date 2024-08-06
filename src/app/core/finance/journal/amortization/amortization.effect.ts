// Angulamortization
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap } from 'rxjs/operators';
import { Observable, defer, of, forkJoin } from 'rxjs';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store, select, Action } from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../../../_base/crud';
// Services
import { AmortizationService } from './amortization.service';
// State
import { AppState } from '../../../reducers';
import {
	AmortizationActionTypes,
	AmortizationPageRequested,
	AmortizationPageLoaded,
	AmortizationCreated,
	AmortizationDeleted,
	AmortizationUpdated,
	AmortizationOnServerCreated,
	AmortizationActionToggleLoading,
	AmortizationPageToggleLoading
} from './amortization.action';
import { QueryAmortizationModel } from './queryamortization.model';


@Injectable()
export class AmortizationEffect {
	showPageLoadingDistpatcher = new AmortizationPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new AmortizationPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new AmortizationActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new AmortizationActionToggleLoading({ isLoading: false });

	@Effect()
	loadAmortizationPage$ = this.actions$
		.pipe(
			ofType<AmortizationPageRequested>(AmortizationActionTypes.AmortizationPageRequested),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.amortization.getListAmortization(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryAmortizationModel = response[1];
				return new AmortizationPageLoaded({
					amortization: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);
	@Effect()
	deleteAmortization$ = this.actions$
		.pipe(
			ofType<AmortizationDeleted>(AmortizationActionTypes.AmortizationDeleted),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.amortization.deleteAmortization(payload.id);
			}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateAmortization = this.actions$
		.pipe(
			ofType<AmortizationUpdated>(AmortizationActionTypes.AmortizationUpdated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.amortization.updateAmortization(payload.amortization);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<AmortizationOnServerCreated>(AmortizationActionTypes.AmortizationOnServerCreated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.amortization.createAmortization(payload.amortization).pipe(
					tap(res => {
						this.store.dispatch(new AmortizationCreated({ amortization: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private amortization: AmortizationService, private store: Store<AppState>) { }
}
