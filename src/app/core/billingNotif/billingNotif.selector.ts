// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { billingNotifState } from './billingNotif.reducer';
import { each } from 'lodash';
import { billingNotifModel } from './billingNotif.model';


export const selectbillingNotifState = createFeatureSelector<billingNotifState>('billingNotif');

export const selectbillingNotifById = (billingNotifId: string) => createSelector(
	selectbillingNotifState,
	billingNotifState =>  billingNotifState.entities[billingNotifId]
);

export const selectbillingNotifPageLoading = createSelector(
	selectbillingNotifState,
	billingNotifState => {
		return billingNotifState.listLoading;
	}
);

export const selectbillingNotifActionLoading = createSelector(
	selectbillingNotifState,
	billingNotifState => billingNotifState.actionsloading
);

export const selectLastCreatedbillingNotifId = createSelector(
	selectbillingNotifState,
	billingNotifState => billingNotifState.lastCreatedbillingNotifId
);

export const selectbillingNotifPageLastQuery = createSelector(
	selectbillingNotifState,
	billingNotifState => billingNotifState.lastQuery
);

export const selectbillingNotifInStore = createSelector(
	selectbillingNotifState,
	billingNotifState => {
		const items: billingNotifModel[] = [];
		each(billingNotifState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: billingNotifModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, billingNotifState.totalCount, '');
	}
);

export const selectbillingNotifShowInitWaitingMessage = createSelector(
	selectbillingNotifState,
	billingNotifState => billingNotifState.showInitWaitingMessage
);

export const selectHasbillingNotifInStore = createSelector(
	selectbillingNotifState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
