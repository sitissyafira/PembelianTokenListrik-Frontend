import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
import { CustomerState } from './customer.reducer';
import { each } from 'lodash';
import { CustomerModel } from './customer.model';


export const selectCustomerState = createFeatureSelector<CustomerState>('customer');

export const selectCustomerById = (customerId: string) => createSelector(
	selectCustomerState,
	customerState =>  customerState.entities[customerId]
);

export const selectCustomerPageLoading = createSelector(
	selectCustomerState,
	customerState => {
		return customerState.listLoading;
	}
);

export const selectCustomerActionLoading = createSelector(
	selectCustomerState,
	customerState => customerState.actionsloading
);

export const selectLastCreatedCustomerId = createSelector(
	selectCustomerState,
	customerState => customerState.lastCreatedCustomerId
);

export const selectCustomerPageLastQuery = createSelector(
	selectCustomerState,
	customerState => customerState.lastQuery
);

export const selectCustomerInStore = createSelector(
	selectCustomerState,
	customerState => {
		const items: CustomerModel[] = [];
		each(customerState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: CustomerModel[] = httpExtension.sortArray(items, customerState.lastQuery.sortField, customerState.lastQuery.sortOrder);
		return new QueryResultsModel(result, customerState.totalCount, '');
	}
);

export const selectCustomerShowInitWaitingMessage = createSelector(
	selectCustomerState,
	customerState => customerState.showInitWaitingMessage
);

export const selectHasCustomerInStore = createSelector(
	selectCustomerState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
