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
import { OwnershipContractService } from './ownership.service';
// State
import { AppState } from '../../../core/reducers';
import {
	OwnershipContractActionTypes,
	OwnershipContractPageRequested,
	OwnershipContractPageLoaded,
	OwnershipContractCreated,
	OwnershipContractDeleted,
	OwnershipContractUpdated,
	OwnershipContractOnServerCreated,
	OwnershipContractActionToggleLoading,
	OwnershipContractPageToggleLoading
} from './ownership.action';
import { QueryOwnerTransactionModel } from './queryowner.model';


@Injectable()
export class OwnershipContractEffect {
	showPageLoadingDistpatcher = new OwnershipContractPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new OwnershipContractPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new OwnershipContractActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new OwnershipContractActionToggleLoading({ isLoading: false });

	@Effect()
	loadOwnershipContractPage$ = this.actions$
		.pipe(
			ofType<OwnershipContractPageRequested>(OwnershipContractActionTypes.OwnershipContractPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.ownershipContract.getListOwnershipContract(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryOwnerTransactionModel = response[1];
				return new OwnershipContractPageLoaded({
					ownershipcontract: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteOwnershipContract$ = this.actions$
		.pipe(
			ofType<OwnershipContractDeleted>(OwnershipContractActionTypes.OwnershipContractDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.ownershipContract.deleteOwnershipContract(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateOwnershipContract = this.actions$
		.pipe(
			ofType<OwnershipContractUpdated>(OwnershipContractActionTypes.OwnershipContractUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.ownershipContract.updateOwnershipContract(payload.ownershipcontract);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<OwnershipContractOnServerCreated>(OwnershipContractActionTypes.OwnershipContractOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.ownershipContract.createOwnershipContract(payload.ownershipcontract).pipe(
					tap(res => {
						this.store.dispatch(new OwnershipContractCreated({ ownershipcontract: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private ownershipContract: OwnershipContractService, private store: Store<AppState>) { }
}
