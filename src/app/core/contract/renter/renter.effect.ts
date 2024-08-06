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
import { RenterContractService } from './renter.service';
// State
import { AppState } from '../../../core/reducers';
import {
	RenterContractActionTypes,
	RenterContractPageRequested,
	RenterContractPageLoaded,
	RenterContractCreated,
	RenterContractDeleted,
	RenterContractUpdated,
	RenterContractOnServerCreated,
	RenterContractActionToggleLoading,
	RenterContractPageToggleLoading,
	RenterContractPageToggleCheckout,
	RenterContractActionToggleCheckout
} from './renter.action';
import { QueryrenterModel } from './queryrenter.model';

@Injectable()
export class RenterContractEffect {
	showPageLoadingDistpatcher = new RenterContractPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new RenterContractPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new RenterContractActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new RenterContractActionToggleLoading({ isLoading: false });

	@Effect()
	loadRenterContractPage$ = this.actions$
		.pipe(
			ofType<RenterContractPageRequested>(RenterContractActionTypes.RenterContractPageRequested),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.renterContract.getListRenterContract(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryrenterModel = response[1];
				return new RenterContractPageLoaded({
					rentercontract: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);
		@Effect()
		loadRenterContractPageCheckout$ = this.actions$
			.pipe(
				ofType<RenterContractActionToggleCheckout>(RenterContractActionTypes.RenterContractActionToggleCheckout),
				mergeMap(( { payload } ) => {
					this.store.dispatch(this.showPageLoadingDistpatcher);
					const requestToServer = this.renterContract.getListRenterContractCheckOut(payload.page);
					const lastQuery = of(payload.page);
					return forkJoin(requestToServer, lastQuery);
				}),
				map(response => {
					let res: { errorMessage: string; totalCount: any; items: any };
					const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: '', data: [] };
					const lastQuery: QueryrenterModel = response[1];
					console.log(result,"effect")
					return new RenterContractPageToggleCheckout({
						rentercontract: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}),
			);

	@Effect()
	deleteRenterContract$ = this.actions$
		.pipe(
			ofType<RenterContractDeleted>(RenterContractActionTypes.RenterContractDeleted),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.renterContract.deleteRenterContract(payload.id);
			}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateRenterContract = this.actions$
		.pipe(
			ofType<RenterContractUpdated>(RenterContractActionTypes.RenterContractUpdated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.renterContract.updateRenterContract(payload.rentercontract);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<RenterContractOnServerCreated>(RenterContractActionTypes.RenterContractOnServerCreated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.renterContract.createRenterContract(payload.rentercontract).pipe(
					tap(res => {
						this.store.dispatch(new RenterContractCreated({ rentercontract: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private renterContract: RenterContractService, private store: Store<AppState>) { }
}
