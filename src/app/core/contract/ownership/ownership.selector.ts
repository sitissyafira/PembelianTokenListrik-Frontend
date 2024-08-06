// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { OwnershipContractState } from './ownership.reducer';
import { each } from 'lodash';
import { OwnershipContractModel } from './ownership.model';

export const selectOwnershipContractState = createFeatureSelector<OwnershipContractState>('ownershipcontract');

export const selectOwnershipContractById = (ownershipcontractId: string) => createSelector(
	selectOwnershipContractState,
	ownershipcontractState =>  ownershipcontractState.entities[ownershipcontractId]
);

export const selectOwnershipContractPageLoading = createSelector(
	selectOwnershipContractState,
	ownershipcontractState => {
		return ownershipcontractState.listLoading;
	}
);

export const selectOwnershipContractActionLoading = createSelector(
	selectOwnershipContractState,
	ownershipcontractState => ownershipcontractState.actionsloading
);

export const selectLastCreatedOwnershipContractId = createSelector(
	selectOwnershipContractState,
	ownershipcontractState => ownershipcontractState.lastCreatedOwnershipContractId
);

export const selectOwnershipContractPageLastQuery = createSelector(
	selectOwnershipContractState,
	ownershipcontractState => ownershipcontractState.lastQuery
);

export const selectOwnershipContractInStore = createSelector(
	selectOwnershipContractState,
	ownershipcontractState => {
		const items: OwnershipContractModel[] = [];
		each(ownershipcontractState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: OwnershipContractModel[] = httpExtension.sortArray(items, ownershipcontractState.lastQuery.sortField, ownershipcontractState.lastQuery.sortOrder);
		return new QueryResultsModel(result, ownershipcontractState.totalCount, '');
	}
);

export const selectOwnershipContractShowInitWaitingMessage = createSelector(
	selectOwnershipContractState,
	ownershipcontractState => ownershipcontractState.showInitWaitingMessage
);

export const selectHasownershipContractInStore = createSelector(
	selectOwnershipContractState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
