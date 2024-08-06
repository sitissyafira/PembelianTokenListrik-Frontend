import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
import { BillingState } from './billing.reducer';
import { each } from 'lodash';
import {BillingModel} from './billing.model';

export const selectBillingState = createFeatureSelector<BillingState>('billing');
export const selectBillingById = (billingId: string) => createSelector(
	selectBillingState,
	billingState =>  billingState.entities[billingId]
);
export const selectBillingPageLoading = createSelector(
	selectBillingState,
	billingState => {
		return billingState.listLoading;
	}
);
export const selectBillingActionLoading = createSelector(
	selectBillingState,
	billingState => billingState.actionsloading
);
export const selectLastCreatedBillingId = createSelector(
	selectBillingState,
	billingState => billingState.lastCreatedBillingId
);
export const selectBillingPageLastQuery = createSelector(
	selectBillingState,
	billingState => billingState.lastQuery
);
export const selectBillingInStore = createSelector(
	selectBillingState,
	billingState => {
		const items: BillingModel[] = [];
		each(billingState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: BillingModel[] = httpExtension.sortArray(items, billingState.lastQuery.sortField, billingState.lastQuery.sortOrder);
		return new QueryResultsModel(result, billingState.totalCount, '');
	}
);
export const selectBillingShowInitWaitingMessage = createSelector(
	selectBillingState,
	billingState => billingState.showInitWaitingMessage
);
export const selectHasBillingInStore = createSelector(
	selectBillingState,
	queryResult => {
		if (!queryResult.totalCount) {
		return false;
		}
		return true;
	}
);
