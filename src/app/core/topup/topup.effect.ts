// Angular
import { Injectable } from "@angular/core";
// RxJS
import { mergeMap, map, tap } from "rxjs/operators";
import { of, forkJoin } from "rxjs";
// NGRX
import { Effect, Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
// CRUD
import { QueryResultsModel } from "../_base/crud";
// Services
import { TopUpService } from "./topup.service";
// State
import { AppState } from "../reducers";
import {
	TopUpActionTypes,
	TopUpPageRequested,
	TopUpPageLoaded,
	TopUpCreated,
	TopUpDeleted,
	TopUpUpdated,
	TopUpOnServerCreated,
	TopUpActionToggleLoading,
	TopUpPageToggleLoading,
	TopUpPageRequestedLog,
} from "./topup.action";
import { QueryTopUpModel } from "./querytopup.model";

@Injectable()
export class TopUpEffect {
	showPageLoadingDistpatcher = new TopUpPageToggleLoading({
		isLoading: true,
	});
	hidePageLoadingDistpatcher = new TopUpPageToggleLoading({
		isLoading: false,
	});

	showActionLoadingDistpatcher = new TopUpActionToggleLoading({
		isLoading: true,
	});
	hideActionLoadingDistpatcher = new TopUpActionToggleLoading({
		isLoading: false,
	});

	@Effect()
	loadTopUpPage$ = this.actions$.pipe(
		ofType<TopUpPageRequested>(TopUpActionTypes.TopUpPageRequested),
		mergeMap(({ payload }) => {
			this.store.dispatch(this.showPageLoadingDistpatcher);
			const requestToServer = this.topup.getListTopUp(payload.page);
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

			const lastQuery: QueryTopUpModel = response[1];
			return new TopUpPageLoaded({
				topup: result.items,
				totalCount: result.totalCount,
				page: lastQuery,
			});
		})
	);


	@Effect()
	loadTopUpPageLog$ = this.actions$.pipe(
		ofType<TopUpPageRequestedLog>(TopUpActionTypes.TopUpPageRequestedLog),
		mergeMap(({ payload }) => {
			this.store.dispatch(this.showPageLoadingDistpatcher);
			const requestToServer = this.topup.getListTopUpLog(payload.page);
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
			const lastQuery: QueryTopUpModel = response[1];
			return new TopUpPageLoaded({
				topup: result.items,
				totalCount: result.totalCount,
				page: lastQuery,
			});
		})
	);

	@Effect()
	deleteTopUp$ = this.actions$.pipe(
		ofType<TopUpDeleted>(TopUpActionTypes.TopUpDeleted),
		mergeMap(({ payload }) => {
			this.store.dispatch(this.showActionLoadingDistpatcher);
			return this.topup.deleteTopUp(payload.id);
		}),
		map(() => {
			return this.hideActionLoadingDistpatcher;
		})
	);

	@Effect()
	updateTopUp = this.actions$.pipe(
		ofType<TopUpUpdated>(TopUpActionTypes.TopUpUpdated),
		mergeMap(({ payload }) => {
			this.store.dispatch(this.showActionLoadingDistpatcher);
			return this.topup.updateTopUp(payload.topup);
		}),
		map(() => {
			return this.hideActionLoadingDistpatcher;
		})
	);

	@Effect()
	createBlock$ = this.actions$.pipe(
		ofType<TopUpOnServerCreated>(
			TopUpActionTypes.TopUpOnServerCreated
		),
		mergeMap(({ payload }) => {
			this.store.dispatch(this.showActionLoadingDistpatcher);
			return this.topup.createTopUp(payload.topup).pipe(
				tap((res) => {
					this.store.dispatch(new TopUpCreated({ topup: res }));
				})
			);
		}),
		map(() => {
			return this.hideActionLoadingDistpatcher;
		})
	);

	constructor(
		private actions$: Actions,
		private topup: TopUpService,
		private store: Store<AppState>
	) { }
}
