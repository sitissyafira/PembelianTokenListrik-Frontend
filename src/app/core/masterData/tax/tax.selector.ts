import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
import { TaxState } from './tax.reducer';
import { each } from 'lodash';
import { TaxModel } from './tax.model';


export const selectTaxState = createFeatureSelector<TaxState>('tax');

export const selectTaxById = (taxId: string) => createSelector(
	selectTaxState,
	taxState =>  taxState.entities[taxId]
);
export const selectTaxPageLoading = createSelector(
	selectTaxState,
	taxState => {
		return taxState.listLoading;
	}
);
export const selectTaxActionLoading = createSelector(
	selectTaxState,
	taxState => taxState.actionsloading
);
export const selectLastCreatedTaxId = createSelector(
	selectTaxState,
	taxState => taxState.lastCreatedTaxId
);
export const selectTaxPageLastQuery = createSelector(
	selectTaxState,
	taxState => taxState.lastQuery
);
export const selectTaxInStore = createSelector(
	selectTaxState,
	taxState => {
		const items: TaxModel[] = [];
		each(taxState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: TaxModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, taxState.totalCount, '');
	}
);
export const selectTaxShowInitWaitingMessage = createSelector(
	selectTaxState,
	taxState => taxState.showInitWaitingMessage
);
export const selectHasTaxInStore = createSelector(
	selectTaxState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
