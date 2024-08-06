import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
import { CurrencyState } from './currency.reducer';
import { each } from 'lodash';
import { CurrencyModel } from './currency.model';


export const selectCurrencyState = createFeatureSelector<CurrencyState>('currency');

export const selectCurrencyById = (currencyId: string) => createSelector(
	selectCurrencyState,
	currencyState =>  currencyState.entities[currencyId]
);
export const selectCurrencyPageLoading = createSelector(
	selectCurrencyState,
	currencyState => {
		return currencyState.listLoading;
	}
);
export const selectCurrencyActionLoading = createSelector(
	selectCurrencyState,
	currencyState => currencyState.actionsloading
);
export const selectLastCreatedCurrencyId = createSelector(
	selectCurrencyState,
	currencyState => currencyState.lastCreatedCurrencyId
);
export const selectCurrencyPageLastQuery = createSelector(
	selectCurrencyState,
	currencyState => currencyState.lastQuery
);
export const selectCurrencyInStore = createSelector(
	selectCurrencyState,
	currencyState => {
		const items: CurrencyModel[] = [];
		each(currencyState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: CurrencyModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, currencyState.totalCount, '');
	}
);
export const selectCurrencyShowInitWaitingMessage = createSelector(
	selectCurrencyState,
	currencyState => currencyState.showInitWaitingMessage
);
export const selectHasCurrencyInStore = createSelector(
	selectCurrencyState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
