// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { LsebillingState } from './lsebilling.reducer';
import { each } from 'lodash';
import { LsebillingModel } from './lsebilling.model';


export const selectLsebillingState = createFeatureSelector<LsebillingState>('lsebilling');

export const selectLsebillingById = (lsebillingId: string) => createSelector(
	selectLsebillingState,
	lsebillingState =>  lsebillingState.entities[lsebillingId]
);

export const selectLsebillingPageLoading = createSelector(
	selectLsebillingState,
	lsebillingState => {
		return lsebillingState.listLoading;
	}
);

export const selectLsebillingActionLoading = createSelector(
	selectLsebillingState,
	lsebillingState => lsebillingState.actionsloading
);

export const selectLastCreatedLsebillingId = createSelector(
	selectLsebillingState,
	lsebillingState => lsebillingState.lastCreatedLsebillingId
);

export const selectLsebillingPageLastQuery = createSelector(
	selectLsebillingState,
	lsebillingState => lsebillingState.lastQuery
);

export const selectLsebillingInStore = createSelector(
	selectLsebillingState,
	lsebillingState => {
		const items: LsebillingModel[] = [];
		each(lsebillingState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: LsebillingModel[] = httpExtension.sortArray(items, lsebillingState.lastQuery.sortField, lsebillingState.lastQuery.sortOrder);
		return new QueryResultsModel(result, lsebillingState.totalCount, '');
	}
);

export const selectLsebillingShowInitWaitingMessage = createSelector(
	selectLsebillingState,
	lsebillingState => lsebillingState.showInitWaitingMessage
);

export const selectHasLsebillingInStore = createSelector(
	selectLsebillingState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
