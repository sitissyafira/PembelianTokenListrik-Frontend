// Angular
import { Injectable } from "@angular/core";
// RxJS
import { mergeMap, map, tap } from "rxjs/operators";
import { of, forkJoin } from "rxjs";
// NGRX
import { Effect, Actions, ofType } from "@ngrx/effects";
import { Store} from "@ngrx/store";
// CRUD
import { QueryResultsModel } from "../_base/crud";
// Services
import { BillingService } from "./billing.service";
// State
import { AppState } from "../../core/reducers";
import {
	BillingActionTypes,
	BillingPageRequested,
	BillingPageLoaded,
	BillingCreated,
	BillingDeleted,
	BillingUpdated,
	BillingOnServerCreated,
	BillingActionToggleLoading,
	BillingPageToggleLoading,
	BillingPageRequestedLog,
} from "./billing.action";
import { QueryBillingModel } from "./querybilling.model";

@Injectable()
export class BillingEffect {
	showPageLoadingDistpatcher = new BillingPageToggleLoading({
		isLoading: true,
	});
	hidePageLoadingDistpatcher = new BillingPageToggleLoading({
		isLoading: false,
	});

	showActionLoadingDistpatcher = new BillingActionToggleLoading({
		isLoading: true,
	});
	hideActionLoadingDistpatcher = new BillingActionToggleLoading({
		isLoading: false,
	});

	@Effect()
	loadBillingPage$ = this.actions$.pipe(
		ofType<BillingPageRequested>(BillingActionTypes.BillingPageRequested),
		mergeMap(({ payload }) => {
			this.store.dispatch(this.showPageLoadingDistpatcher);
			const requestToServer = this.billing.getListBilling(payload.page);
			const lastQuery = of(payload.page);
			return forkJoin(requestToServer, lastQuery);
		}),
		map((response) => {
			let res: { errorMessage: string; totalCount: any; items: any };
			const result: QueryResultsModel = {
				items: response[0].data,
				totalCount: response[0].totalCount,
				errorMessage: "",
				data: [],
			};

			const lastQuery: QueryBillingModel = response[1];
			return new BillingPageLoaded({
				billing: result.items,
				totalCount: result.totalCount,
				page: lastQuery,
			});
		})
	);


	@Effect()
	loadBillingPageLog$ = this.actions$.pipe(
		ofType<BillingPageRequestedLog>(BillingActionTypes.BillingPageRequestedLog),
		mergeMap(({ payload }) => {
			this.store.dispatch(this.showPageLoadingDistpatcher);
			const requestToServer = this.billing.getListBillingLog(payload.page);
			const lastQuery = of(payload.page);
			return forkJoin(requestToServer, lastQuery);
		}),
		map((response) => {
			let res: { errorMessage: string; totalCount: any; items: any };
			const result: QueryResultsModel = {
				items: response[0].data,
				totalCount: response[0].totalCount,
				errorMessage: "",
				data: [],
			};
			const lastQuery: QueryBillingModel = response[1];
			return new BillingPageLoaded({
				billing: result.items,
				totalCount: result.totalCount,
				page: lastQuery,
			});
		})
	);

	@Effect()
	deleteBilling$ = this.actions$.pipe(
		ofType<BillingDeleted>(BillingActionTypes.BillingDeleted),
		mergeMap(({ payload }) => {
			this.store.dispatch(this.showActionLoadingDistpatcher);
			return this.billing.deleteBilling(payload.id);
		}),
		map(() => {
			return this.hideActionLoadingDistpatcher;
		})
	);

	@Effect()
	updateBilling = this.actions$.pipe(
		ofType<BillingUpdated>(BillingActionTypes.BillingUpdated),
		mergeMap(({ payload }) => {
			this.store.dispatch(this.showActionLoadingDistpatcher);
			return this.billing.updateBilling(payload.billing);
		}),
		map(() => {
			return this.hideActionLoadingDistpatcher;
		})
	);

	@Effect()
	createBlock$ = this.actions$.pipe(
		ofType<BillingOnServerCreated>(
			BillingActionTypes.BillingOnServerCreated
		),
		mergeMap(({ payload }) => {
			this.store.dispatch(this.showActionLoadingDistpatcher);
			return this.billing.createBilling(payload.billing).pipe(
				tap((res) => {
					this.store.dispatch(new BillingCreated({ billing: res }));
				})
			);
		}),
		map(() => {
			return this.hideActionLoadingDistpatcher;
		})
	);

	constructor(
		private actions$: Actions,
		private billing: BillingService,
		private store: Store<AppState>
	) {}
}
