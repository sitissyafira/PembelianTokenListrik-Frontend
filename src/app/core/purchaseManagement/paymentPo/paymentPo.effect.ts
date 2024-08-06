import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
import { QueryResultsModel } from '../../_base/crud';
import { PaymentPoService } from './paymentPo.service';
import { AppState } from '../../reducers';
import {
	PaymentPoActionTypes,
	PaymentPoPageRequested,
	PaymentPoPageLoaded,
	PaymentPoCreated,
	PaymentPoDeleted,
	PaymentPoUpdated,
	PaymentPoOnServerCreated,
	PaymentPoActionToggleLoading,
	PaymentPoPageToggleLoading
} from './paymentPo.action';
import { QueryPaymentPoModel } from './querypaymentPo.model';


@Injectable()
export class PaymentPoEffect {
	showPageLoadingDistpatcher = new PaymentPoPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new PaymentPoPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new PaymentPoActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new PaymentPoActionToggleLoading({ isLoading: false });

	@Effect()
	loadPaymentPoPage$ = this.actions$
		.pipe(
			ofType<PaymentPoPageRequested>(PaymentPoActionTypes.PaymentPoPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.paymentPo.getListPaymentPo(payload.page)
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
				const lastQuery: QueryPaymentPoModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new PaymentPoPageLoaded({
					paymentPo: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new PaymentPoPageLoaded({
						paymentPo: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deletePaymentPo$ = this.actions$
		.pipe(
			ofType<PaymentPoDeleted>(PaymentPoActionTypes.PaymentPoDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.paymentPo.deletePaymentPo(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updatePaymentPo = this.actions$
		.pipe(
			ofType<PaymentPoUpdated>(PaymentPoActionTypes.PaymentPoUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.paymentPo.updatePaymentPo(payload.paymentPo);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<PaymentPoOnServerCreated>(PaymentPoActionTypes.PaymentPoOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.paymentPo.createPaymentPo(payload.paymentPo).pipe(
					tap(res => {
						this.store.dispatch(new PaymentPoCreated({ paymentPo: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private paymentPo: PaymentPoService, private store: Store<AppState>) { }
}
