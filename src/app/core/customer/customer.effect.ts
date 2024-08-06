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
import { CustomerService } from './customer.service';
// State
import { AppState } from '../../core/reducers';
import {
	CustomerActionTypes,
	CustomerPageRequested,
	CustomerPageLoaded,
	CustomerCreated,
	CustomerDeleted,
	CustomerUpdated,
	CustomerOnServerCreated,
	CustomerActionToggleLoading,
	CustomerPageToggleLoading
} from './customer.action';
import { QueryCustomerModel } from './querycustomer.model';

@Injectable()
export class CustomerEffect {
	showPageLoadingDistpatcher = new CustomerPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new CustomerPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new CustomerActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new CustomerActionToggleLoading({ isLoading: false });

	@Effect()
	loadCustomerPage$ = this.actions$
		.pipe(
			ofType<CustomerPageRequested>(CustomerActionTypes.CustomerPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.customer.getListCustomer(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryCustomerModel = response[1];
				return new CustomerPageLoaded({
					customer: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteCustomer$ = this.actions$
		.pipe(
			ofType<CustomerDeleted>(CustomerActionTypes.CustomerDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.customer.deleteCustomer(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateCustomer = this.actions$
		.pipe(
			ofType<CustomerUpdated>(CustomerActionTypes.CustomerUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.customer.updateCustomer(payload.customer);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createCustomer$ = this.actions$
		.pipe(
			ofType<CustomerOnServerCreated>(CustomerActionTypes.CustomerOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.customer.createCustomer(payload.customer).pipe(
					tap(res => {
						this.store.dispatch(new CustomerCreated({ customer: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private customer: CustomerService, private store: Store<AppState>) { }
}
