import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
import { PurchaseOrderState } from './purchaseOrder.reducer';
import { each } from 'lodash';
import { PurchaseOrderModel } from './purchaseOrder.model';


export const selectPurchaseOrderState = createFeatureSelector<PurchaseOrderState>('purchaseOrder');

export const selectPurchaseOrderById = (purchaseOrderId: string) => createSelector(
	selectPurchaseOrderState,
	purchaseOrderState =>  purchaseOrderState.entities[purchaseOrderId]
);
export const selectPurchaseOrderPageLoading = createSelector(
	selectPurchaseOrderState,
	purchaseOrderState => {
		return purchaseOrderState.listLoading;
	}
);
export const selectPurchaseOrderActionLoading = createSelector(
	selectPurchaseOrderState,
	purchaseOrderState => purchaseOrderState.actionsloading
);
export const selectLastCreatedPurchaseOrderId = createSelector(
	selectPurchaseOrderState,
	purchaseOrderState => purchaseOrderState.lastCreatedPurchaseOrderId
);
export const selectPurchaseOrderPageLastQuery = createSelector(
	selectPurchaseOrderState,
	purchaseOrderState => purchaseOrderState.lastQuery
);
export const selectPurchaseOrderInStore = createSelector(
	selectPurchaseOrderState,
	purchaseOrderState => {
		const items: PurchaseOrderModel[] = [];
		each(purchaseOrderState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: PurchaseOrderModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, purchaseOrderState.totalCount, '');
	}
);
export const selectPurchaseOrderShowInitWaitingMessage = createSelector(
	selectPurchaseOrderState,
	purchaseOrderState => purchaseOrderState.showInitWaitingMessage
);
export const selectHasPurchaseOrderInStore = createSelector(
	selectPurchaseOrderState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
