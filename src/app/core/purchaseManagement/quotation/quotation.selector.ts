import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
import { QuotationState } from './quotation.reducer';
import { each } from 'lodash';
import { QuotationModel } from './quotation.model';


export const selectQuotationState = createFeatureSelector<QuotationState>('quotation');

export const selectQuotationById = (quotationId: string) => createSelector(
	selectQuotationState,
	quotationState =>  quotationState.entities[quotationId]
);
export const selectQuotationPageLoading = createSelector(
	selectQuotationState,
	quotationState => {
		return quotationState.listLoading;
	}
);
export const selectQuotationActionLoading = createSelector(
	selectQuotationState,
	quotationState => quotationState.actionsloading
);
export const selectLastCreatedQuotationId = createSelector(
	selectQuotationState,
	quotationState => quotationState.lastCreatedQuotationId
);
export const selectQuotationPageLastQuery = createSelector(
	selectQuotationState,
	quotationState => quotationState.lastQuery
);
export const selectQuotationInStore = createSelector(
	selectQuotationState,
	quotationState => {
		const items: QuotationModel[] = [];
		each(quotationState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: QuotationModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, quotationState.totalCount, '');
	}
);
export const selectQuotationShowInitWaitingMessage = createSelector(
	selectQuotationState,
	quotationState => quotationState.showInitWaitingMessage
);
export const selectHasQuotationInStore = createSelector(
	selectQuotationState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
