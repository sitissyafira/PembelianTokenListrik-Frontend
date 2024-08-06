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
import { LeaseContractService } from './lease.service';
// State
import { AppState } from '../../../core/reducers';
import {
	LeaseContractActionTypes,
	LeaseContractPageRequested,
	LeaseContractPageLoaded,
	LeaseContractCreated,
	LeaseContractDeleted,
	LeaseContractUpdated,
	LeaseContractOnServerCreated,
	LeaseContractActionToggleLoading,
	LeaseContractPageToggleLoading
} from './lease.action';
import { QueryleaseModel } from './querylease.model';

@Injectable()
export class LeaseContractEffect {
	showPageLoadingDistpatcher = new LeaseContractPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new LeaseContractPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new LeaseContractActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new LeaseContractActionToggleLoading({ isLoading: false });

	@Effect()
	loadLeaseContractPage$ = this.actions$
		.pipe(
			ofType<LeaseContractPageRequested>(LeaseContractActionTypes.LeaseContractPageRequested),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.leaseContract.getListLeaseContract(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryleaseModel = response[1];
				return new LeaseContractPageLoaded({
					leasecontract: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteLeaseContract$ = this.actions$
		.pipe(
			ofType<LeaseContractDeleted>(LeaseContractActionTypes.LeaseContractDeleted),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.leaseContract.deleteLeaseContract(payload.id);
			}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateLeaseContract = this.actions$
		.pipe(
			ofType<LeaseContractUpdated>(LeaseContractActionTypes.LeaseContractUpdated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.leaseContract.updateLeaseContract(payload.leasecontract);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<LeaseContractOnServerCreated>(LeaseContractActionTypes.LeaseContractOnServerCreated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.leaseContract.createLeaseContract(payload.leasecontract).pipe(
					tap(res => {
						this.store.dispatch(new LeaseContractCreated({ leasecontract: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private leaseContract: LeaseContractService, private store: Store<AppState>) { }
}
