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
import { TrGalonService } from "./trGalon.service";
// State
import { AppState } from "../../core/reducers";
import {
	TrGalonActionTypes,
	TrGalonPageRequested,
	TrGalonPageLoaded,
	TrGalonCreated,
	TrGalonDeleted,
	TrGalonUpdated,
	TrGalonOnServerCreated,
	TrGalonActionToggleLoading,
	TrGalonPageToggleLoading,
	TrGalonPageRequestedLog,
} from "./trGalon.action";
import { QueryTrGalonModel } from "./querytrGalon.model";

@Injectable()
export class TrGalonEffect {
	showPageLoadingDistpatcher = new TrGalonPageToggleLoading({
		isLoading: true,
	});
	hidePageLoadingDistpatcher = new TrGalonPageToggleLoading({
		isLoading: false,
	});

	showActionLoadingDistpatcher = new TrGalonActionToggleLoading({
		isLoading: true,
	});
	hideActionLoadingDistpatcher = new TrGalonActionToggleLoading({
		isLoading: false,
	});

	@Effect()
	loadTrGalonPage$ = this.actions$.pipe(
		ofType<TrGalonPageRequested>(TrGalonActionTypes.TrGalonPageRequested),
		mergeMap(({ payload }) => {
			this.store.dispatch(this.showPageLoadingDistpatcher);
			const requestToServer = this.trGalon.getListTrGalon(payload.page);
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

			const lastQuery: QueryTrGalonModel = response[1];
			return new TrGalonPageLoaded({
				trGalon: result.items,
				totalCount: result.totalCount,
				page: lastQuery,
			});
		})
	);


	@Effect()
	loadTrGalonPageLog$ = this.actions$.pipe(
		ofType<TrGalonPageRequestedLog>(TrGalonActionTypes.TrGalonPageRequestedLog),
		mergeMap(({ payload }) => {
			this.store.dispatch(this.showPageLoadingDistpatcher);
			const requestToServer = this.trGalon.getListTrGalonLog(payload.page);
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
			const lastQuery: QueryTrGalonModel = response[1];
			return new TrGalonPageLoaded({
				trGalon: result.items,
				totalCount: result.totalCount,
				page: lastQuery,
			});
		})
	);

	@Effect()
	deleteTrGalon$ = this.actions$.pipe(
		ofType<TrGalonDeleted>(TrGalonActionTypes.TrGalonDeleted),
		mergeMap(({ payload }) => {
			this.store.dispatch(this.showActionLoadingDistpatcher);
			return this.trGalon.deleteTrGalon(payload.id);
		}),
		map(() => {
			return this.hideActionLoadingDistpatcher;
		})
	);

	@Effect()
	updateTrGalon = this.actions$.pipe(
		ofType<TrGalonUpdated>(TrGalonActionTypes.TrGalonUpdated),
		mergeMap(({ payload }) => {
			this.store.dispatch(this.showActionLoadingDistpatcher);
			return this.trGalon.updateTrGalon(payload.trGalon);
		}),
		map(() => {
			return this.hideActionLoadingDistpatcher;
		})
	);

	@Effect()
	createBlock$ = this.actions$.pipe(
		ofType<TrGalonOnServerCreated>(
			TrGalonActionTypes.TrGalonOnServerCreated
		),
		mergeMap(({ payload }) => {
			this.store.dispatch(this.showActionLoadingDistpatcher);
			return this.trGalon.createTrGalon(payload.trGalon).pipe(
				tap((res) => {
					this.store.dispatch(new TrGalonCreated({ trGalon: res }));
				})
			);
		}),
		map(() => {
			return this.hideActionLoadingDistpatcher;
		})
	);

	constructor(
		private actions$: Actions,
		private trGalon: TrGalonService,
		private store: Store<AppState>
	) { }
}
