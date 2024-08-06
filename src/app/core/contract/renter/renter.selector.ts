// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { RenterContractState } from './renter.reducer';
import { each } from 'lodash';
import { RenterContractModel } from './renter.model';


export const selectRenterContractState = createFeatureSelector<RenterContractState>('rentercontract');

export const selectRenterContractById = (rentercontractId: string) => createSelector(
	selectRenterContractState,
	rentercontractState => rentercontractState.entities[rentercontractId]
);

export const selectRenterContractPageLoading = createSelector(
	selectRenterContractState,
	rentercontractState => {
		return rentercontractState.listLoading;
	}
);

export const selectRenterContractActionLoading = createSelector(
	selectRenterContractState,
	rentercontractState => rentercontractState.actionsloading
);

export const selectLastCreatedRenterContractId = createSelector(
	selectRenterContractState,
	rentercontractState => rentercontractState.lastCreatedRenterContractId
);

export const selectRenterContractPageLastQuery = createSelector(
	selectRenterContractState,
	rentercontractState => rentercontractState.lastQuery
);

export const selectRenterContractInStore = createSelector(
	selectRenterContractState,
	rentercontractState => {
		const items: RenterContractModel[] = [];
		each(rentercontractState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: RenterContractModel[] = httpExtension.sortArray(items, rentercontractState.lastQuery.sortField, rentercontractState.lastQuery.sortOrder);
		return new QueryResultsModel(result, rentercontractState.totalCount, '');
	}
);

export const selectRenterContractShowInitWaitingMessage = createSelector(
	selectRenterContractState,
	rentercontractState => rentercontractState.showInitWaitingMessage
);

export const selectHasRenterContractInStore = createSelector(
	selectRenterContractState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
