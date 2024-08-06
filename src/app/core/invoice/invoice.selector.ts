// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { InvoiceState } from './invoice.reducer';
import { each } from 'lodash';
import { InvoiceModel } from './invoice.model';


export const selectInvoiceState = createFeatureSelector<InvoiceState>('invoice');

export const selectInvoiceById = (invoiceId: string) => createSelector(
	selectInvoiceState,
	invoiceState =>  invoiceState.entities[invoiceId]
);

export const selectInvoicePageLoading = createSelector(
	selectInvoiceState,
	invoiceState => {
		return invoiceState.listLoading;
	}
);

export const selectInvoiceActionLoading = createSelector(
	selectInvoiceState,
	invoiceState => invoiceState.actionsloading
);

export const selectLastCreatedInvoiceId = createSelector(
	selectInvoiceState,
	invoiceState => invoiceState.lastCreatedInvoiceId
);

export const selectInvoicePageLastQuery = createSelector(
	selectInvoiceState,
	invoiceState => invoiceState.lastQuery
);

export const selectInvoiceInStore = createSelector(
	selectInvoiceState,
	invoiceState => {
		const items: InvoiceModel[] = [];
		each(invoiceState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: InvoiceModel[] = httpExtension.sortArray(items, invoiceState.lastQuery.sortField, invoiceState.lastQuery.sortOrder);
		return new QueryResultsModel(result, invoiceState.totalCount, '');
	}
);

export const selectInvoiceShowInitWaitingMessage = createSelector(
	selectInvoiceState,
	invoiceState => invoiceState.showInitWaitingMessage
);

export const selectHasInvoiceGroupInStore = createSelector(
	selectInvoiceState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
