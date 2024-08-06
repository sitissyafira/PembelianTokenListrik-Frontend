// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { LeaseContractState } from './lease.reducer';
import { each } from 'lodash';
import { LeaseContractModel } from './lease.model';


export const selectLeaseContractState = createFeatureSelector<LeaseContractState>('leasecontract');

export const selectLeaseContractById = (leasecontractId: string) => createSelector(
	selectLeaseContractState,
	leasecontractState => leasecontractState.entities[leasecontractId]
);

export const selectLeaseContractPageLoading = createSelector(
	selectLeaseContractState,
	leasecontractState => {
		return leasecontractState.listLoading;
	}
);

export const selectLeaseContractActionLoading = createSelector(
	selectLeaseContractState,
	leasecontractState => leasecontractState.actionsloading
);

export const selectLastCreatedLeaseContractId = createSelector(
	selectLeaseContractState,
	leasecontractState => leasecontractState.lastCreatedLeaseContractId
);

export const selectLeaseContractPageLastQuery = createSelector(
	selectLeaseContractState,
	leasecontractState => leasecontractState.lastQuery
);

export const selectLeaseContractInStore = createSelector(
	selectLeaseContractState,
	leasecontractState => {
		const items: LeaseContractModel[] = [];
		each(leasecontractState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: LeaseContractModel[] = httpExtension.sortArray(items, leasecontractState.lastQuery.sortField, leasecontractState.lastQuery.sortOrder);
		return new QueryResultsModel(result, leasecontractState.totalCount, '');
	}
);

export const selectLeaseContractShowInitWaitingMessage = createSelector(
	selectLeaseContractState,
	leasecontractState => leasecontractState.showInitWaitingMessage
);

export const selectHasLeaseContractInStore = createSelector(
	selectLeaseContractState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
