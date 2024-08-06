import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
import { RequestInvoiceState } from './requestInvoice.reducer';
import { each } from 'lodash';
import { RequestInvoiceModel } from './requestInvoice.model';

export const selectRequestInvoiceState = createFeatureSelector<RequestInvoiceState>('requestInvoice');

export const selectRequestInvoiceById = (requestInvoiceId: string) => createSelector(
	selectRequestInvoiceState,
	requestInvoiceState =>  requestInvoiceState.entities[requestInvoiceId]
);
export const selectRequestInvoicePageLoading = createSelector(
	selectRequestInvoiceState,
	requestInvoiceState => {
		return requestInvoiceState.listLoading;
	}
);
export const selectRequestInvoiceActionLoading = createSelector(
	selectRequestInvoiceState,
	requestInvoiceState => requestInvoiceState.actionsloading
);
export const selectLastCreatedRequestInvoiceId = createSelector(
	selectRequestInvoiceState,
	requestInvoiceState => requestInvoiceState.lastCreatedRequestInvoiceId
);
export const selectRequestInvoicePageLastQuery = createSelector(
	selectRequestInvoiceState,
	requestInvoiceState => requestInvoiceState.lastQuery
);
export const selectRequestInvoiceInStore = createSelector(
	selectRequestInvoiceState,
	requestInvoiceState => {
		const items: RequestInvoiceModel[] = [];
		each(requestInvoiceState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: RequestInvoiceModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, requestInvoiceState.totalCount, '');
	}
);
export const selectRequestInvoiceShowInitWaitingMessage = createSelector(
	selectRequestInvoiceState,
	requestInvoiceState => requestInvoiceState.showInitWaitingMessage
);
export const selectHasRequestInvoiceInStore = createSelector(
	selectRequestInvoiceState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
