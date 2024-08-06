import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
import { StockInState } from './stockIn.reducer';
import { each } from 'lodash';
import { StockInModel } from './stockIn.model';


export const selectStockInState = createFeatureSelector<StockInState>('stockIn');

export const selectStockInById = (stockInId: string) => createSelector(
	selectStockInState,
	stockInState =>  stockInState.entities[stockInId]
);
export const selectStockInPageLoading = createSelector(
	selectStockInState,
	stockInState => {
		return stockInState.listLoading;
	}
);
export const selectStockInActionLoading = createSelector(
	selectStockInState,
	stockInState => stockInState.actionsloading
);
export const selectLastCreatedStockInId = createSelector(
	selectStockInState,
	stockInState => stockInState.lastCreatedStockInId
);
export const selectStockInPageLastQuery = createSelector(
	selectStockInState,
	stockInState => stockInState.lastQuery
);
export const selectStockInInStore = createSelector(
	selectStockInState,
	stockInState => {
		const items: StockInModel[] = [];
		each(stockInState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: StockInModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, stockInState.totalCount, '');
	}
);
export const selectStockInShowInitWaitingMessage = createSelector(
	selectStockInState,
	stockInState => stockInState.showInitWaitingMessage
);
export const selectHasStockInInStore = createSelector(
	selectStockInState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
