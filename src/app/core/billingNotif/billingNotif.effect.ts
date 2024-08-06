// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { Observable, defer, of, forkJoin, throwError } from 'rxjs';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store, select, Action } from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../_base/crud';
// Services
import { billingNotifService } from './billingNotif.service';
// State
import { AppState } from '../reducers';
import {
	billingNotifActionTypes,
	billingNotifPageRequested,
	billingNotifPageLoaded,
	billingNotifCreated,
	billingNotifDeleted,
	billingNotifUpdated,
	billingNotifOnServerCreated,
	billingNotifActionToggleLoading,
	billingNotifPageToggleLoading
} from './billingNotif.action';
import { QuerybillingNotifModel } from './queryag.model';


@Injectable()
export class billingNotifEffect {
	showPageLoadingDistpatcher = new billingNotifPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new billingNotifPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new billingNotifActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new billingNotifActionToggleLoading({ isLoading: false });

	@Effect()
	loadbillingNotifPage$ = this.actions$
		.pipe(
			ofType<billingNotifPageRequested>(billingNotifActionTypes.billingNotifPageRequested),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.billingNotif
					.getListbillingNotif(payload.page)
					.pipe(
						catchError(err => {
							return throwError(err);
						}),
						catchError(err => {
							return of(err)
						})
					);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map((response: any) => {
				const lastQuery: QuerybillingNotifModel = response[1];
				if (response[0].status && response[0].status === "success") {
					// let res: { errorMessage: string; totalCount: any; items: any };
					const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
					return new billingNotifPageLoaded({
						billingNotif: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				} else {
					const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new billingNotifPageLoaded({
						billingNotif: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deletebillingNotif$ = this.actions$
		.pipe(
			ofType<billingNotifDeleted>(billingNotifActionTypes.billingNotifDeleted),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.billingNotif.deletebillingNotif(payload.id);
			}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updatebillingNotif = this.actions$
		.pipe(
			ofType<billingNotifUpdated>(billingNotifActionTypes.billingNotifUpdated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.billingNotif.updatebillingNotif(payload.billingNotif);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private billingNotif: billingNotifService, private store: Store<AppState>) { }
}
