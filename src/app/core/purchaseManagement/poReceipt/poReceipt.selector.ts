import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
import { PoReceiptState } from './poReceipt.reducer';
import { each } from 'lodash';
import { PoReceiptModel } from './poReceipt.model';


export const selectPoReceiptState = createFeatureSelector<PoReceiptState>('poReceipt');

export const selectPoReceiptById = (poReceiptId: string) => createSelector(
	selectPoReceiptState,
	poReceiptState =>  poReceiptState.entities[poReceiptId]
);
export const selectPoReceiptPageLoading = createSelector(
	selectPoReceiptState,
	poReceiptState => {
		return poReceiptState.listLoading;
	}
);
export const selectPoReceiptActionLoading = createSelector(
	selectPoReceiptState,
	poReceiptState => poReceiptState.actionsloading
);
export const selectLastCreatedPoReceiptId = createSelector(
	selectPoReceiptState,
	poReceiptState => poReceiptState.lastCreatedPoReceiptId
);
export const selectPoReceiptPageLastQuery = createSelector(
	selectPoReceiptState,
	poReceiptState => poReceiptState.lastQuery
);
export const selectPoReceiptInStore = createSelector(
	selectPoReceiptState,
	poReceiptState => {
		const items: PoReceiptModel[] = [];
		each(poReceiptState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: PoReceiptModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, poReceiptState.totalCount, '');
	}
);
export const selectPoReceiptShowInitWaitingMessage = createSelector(
	selectPoReceiptState,
	poReceiptState => poReceiptState.showInitWaitingMessage
);
export const selectHasPoReceiptInStore = createSelector(
	selectPoReceiptState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
