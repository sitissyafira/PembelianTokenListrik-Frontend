import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
import { StockOutState } from './stockOut.reducer';
import { each } from 'lodash';
import { StockOutModel } from './stockOut.model';


export const selectStockOutState = createFeatureSelector<StockOutState>('stockOut');

export const selectStockOutById = (stockOutId: string) => createSelector(
	selectStockOutState,
	stockOutState =>  stockOutState.entities[stockOutId]
);
export const selectStockOutPageLoading = createSelector(
	selectStockOutState,
	stockOutState => {
		return stockOutState.listLoading;
	}
);
export const selectStockOutActionLoading = createSelector(
	selectStockOutState,
	stockOutState => stockOutState.actionsloading
);
export const selectLastCreatedStockOutId = createSelector(
	selectStockOutState,
	stockOutState => stockOutState.lastCreatedStockOutId
);
export const selectStockOutPageLastQuery = createSelector(
	selectStockOutState,
	stockOutState => stockOutState.lastQuery
);
export const selectStockOutInStore = createSelector(
	selectStockOutState,
	stockOutState => {
		const items: StockOutModel[] = [];
		each(stockOutState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: StockOutModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, stockOutState.totalCount, '');
	}
);
export const selectStockOutShowInitWaitingMessage = createSelector(
	selectStockOutState,
	stockOutState => stockOutState.showInitWaitingMessage
);
export const selectHasStockOutInStore = createSelector(
	selectStockOutState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
