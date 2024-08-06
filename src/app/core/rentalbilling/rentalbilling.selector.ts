// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { RentalbillingState } from './rentalbilling.reducer';
import { each } from 'lodash';
import { RentalbillingModel } from './rentalbilling.model';


export const selectRentalbillingState = createFeatureSelector<RentalbillingState>('rentalbilling');

export const selectRentalbillingById = (rentalbillingId: string) => createSelector(
	selectRentalbillingState,
	rentalbillingState =>  rentalbillingState.entities[rentalbillingId]
);

export const selectRentalbillingPageLoading = createSelector(
	selectRentalbillingState,
	rentalbillingState => {
		return rentalbillingState.listLoading;
	}
);

export const selectRentalbillingActionLoading = createSelector(
	selectRentalbillingState,
	rentalbillingState => rentalbillingState.actionsloading
);

export const selectLastCreatedRentalbillingId = createSelector(
	selectRentalbillingState,
	rentalbillingState => rentalbillingState.lastCreatedRentalbillingId
);

export const selectRentalbillingPageLastQuery = createSelector(
	selectRentalbillingState,
	rentalbillingState => rentalbillingState.lastQuery
);

export const selectRentalbillingInStore = createSelector(
	selectRentalbillingState,
	rentalbillingState => {
		const items: RentalbillingModel[] = [];
		each(rentalbillingState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: RentalbillingModel[] = httpExtension.sortArray(items, rentalbillingState.lastQuery.sortField, rentalbillingState.lastQuery.sortOrder);
		return new QueryResultsModel(result, rentalbillingState.totalCount, '');
	}
);

export const selectRentalbillingShowInitWaitingMessage = createSelector(
	selectRentalbillingState,
	rentalbillingState => rentalbillingState.showInitWaitingMessage
);

export const selectHasRentalbillingInStore = createSelector(
	selectRentalbillingState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
