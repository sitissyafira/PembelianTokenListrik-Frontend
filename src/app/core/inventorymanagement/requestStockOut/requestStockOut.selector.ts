import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
import { RequestStockOutState } from './requestStockOut.reducer';
import { each } from 'lodash';
import { RequestStockOutModel } from './requestStockOut.model';


export const selectRequestStockOutState = createFeatureSelector<RequestStockOutState>('requestStockOut');

export const selectRequestStockOutById = (requestStockOutId: string) => createSelector(
	selectRequestStockOutState,
	requestStockOutState =>  requestStockOutState.entities[requestStockOutId]
);
export const selectRequestStockOutPageLoading = createSelector(
	selectRequestStockOutState,
	requestStockOutState => {
		return requestStockOutState.listLoading;
	}
);
export const selectRequestStockOutActionLoading = createSelector(
	selectRequestStockOutState,
	requestStockOutState => requestStockOutState.actionsloading
);
export const selectLastCreatedRequestStockOutId = createSelector(
	selectRequestStockOutState,
	requestStockOutState => requestStockOutState.lastCreatedRequestStockOutId
);
export const selectRequestStockOutPageLastQuery = createSelector(
	selectRequestStockOutState,
	requestStockOutState => requestStockOutState.lastQuery
);
export const selectRequestStockOutInStore = createSelector(
	selectRequestStockOutState,
	requestStockOutState => {
		const items: RequestStockOutModel[] = [];
		each(requestStockOutState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: RequestStockOutModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, requestStockOutState.totalCount, '');
	}
);
export const selectRequestStockOutShowInitWaitingMessage = createSelector(
	selectRequestStockOutState,
	requestStockOutState => requestStockOutState.showInitWaitingMessage
);
export const selectHasRequestStockOutInStore = createSelector(
	selectRequestStockOutState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
