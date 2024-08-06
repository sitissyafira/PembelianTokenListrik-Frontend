import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
import { PurchaseRequestState } from './purchaseRequest.reducer';
import { each } from 'lodash';
import { PurchaseRequestModel } from './purchaseRequest.model';


export const selectPurchaseRequestState = createFeatureSelector<PurchaseRequestState>('purchaseRequest');

export const selectPurchaseRequestById = (purchaseRequestId: string) => createSelector(
	selectPurchaseRequestState,
	purchaseRequestState => {
		return purchaseRequestState.entities[purchaseRequestId]
	} 
);
export const selectPurchaseRequestPageLoading = createSelector(
	selectPurchaseRequestState,
	purchaseRequestState => {
		return purchaseRequestState.listLoading;
	}
);
export const selectPurchaseRequestActionLoading = createSelector(
	selectPurchaseRequestState,
	purchaseRequestState => purchaseRequestState.actionsloading
);
export const selectLastCreatedPurchaseRequestId = createSelector(
	selectPurchaseRequestState,
	purchaseRequestState => purchaseRequestState.lastCreatedPurchaseRequestId
);
export const selectPurchaseRequestPageLastQuery = createSelector(
	selectPurchaseRequestState,
	purchaseRequestState => purchaseRequestState.lastQuery
);
export const selectPurchaseRequestInStore = createSelector(
	selectPurchaseRequestState,
	purchaseRequestState => {
		const items: PurchaseRequestModel[] = [];
		each(purchaseRequestState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: PurchaseRequestModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, purchaseRequestState.totalCount, '');
	}
);
export const selectPurchaseRequestShowInitWaitingMessage = createSelector(
	selectPurchaseRequestState,
	purchaseRequestState => purchaseRequestState.showInitWaitingMessage
);
export const selectHasPurchaseRequestInStore = createSelector(
	selectPurchaseRequestState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
