import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
import { StockProductState } from './stockProduct.reducer';
import { each } from 'lodash';
import { StockProductModel } from './stockProduct.model';


export const selectStockProductState = createFeatureSelector<StockProductState>('stockProduct');

export const selectStockProductById = (stockProductId: string) => createSelector(
	selectStockProductState,
	stockProductState =>  stockProductState.entities[stockProductId]
);
export const selectStockProductPageLoading = createSelector(
	selectStockProductState,
	stockProductState => {
		return stockProductState.listLoading;
	}
);
export const selectStockProductActionLoading = createSelector(
	selectStockProductState,
	stockProductState => stockProductState.actionsloading
);
export const selectLastCreatedStockProductId = createSelector(
	selectStockProductState,
	stockProductState => stockProductState.lastCreatedStockProductId
);
export const selectStockProductPageLastQuery = createSelector(
	selectStockProductState,
	stockProductState => stockProductState.lastQuery
);
export const selectStockProductInStore = createSelector(
	selectStockProductState,
	stockProductState => {
		const items: StockProductModel[] = [];
		each(stockProductState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: StockProductModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, stockProductState.totalCount, '');
	}
);
export const selectStockProductShowInitWaitingMessage = createSelector(
	selectStockProductState,
	stockProductState => stockProductState.showInitWaitingMessage
);
export const selectHasStockProductInStore = createSelector(
	selectStockProductState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
