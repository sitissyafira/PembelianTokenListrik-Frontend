import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../../_base/crud';
import { BillLogState } from './billLog.reducer';
import { each } from 'lodash';
import { BillLogModel } from './billLog.model';

export const selectBillLogState = createFeatureSelector<BillLogState>('billLog');
export const selectBillLogById = (billLogId: string) => createSelector(
	selectBillLogState,
	billLogState =>  billLogState.entities[billLogId]
);

export const selectBillLogPageLoading = createSelector(
	selectBillLogState,
	billLogState => {
		return billLogState.listLoading;
	}
);

export const selectBillLogActionLoading = createSelector(
	selectBillLogState,
	billLogState => billLogState.actionsloading
);

export const selectLastCreatedBillLogId = createSelector(
	selectBillLogState,
	billLogState => billLogState.lastCreatedBillLogId
);

export const selectBillLogPageLastQuery = createSelector(
	selectBillLogState,
	billLogState => billLogState.lastQuery
);

export const selectBillLogInStore = createSelector(
	selectBillLogState,
	billLogState => {
		const items: BillLogModel[] = [];
		each(billLogState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: BillLogModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, billLogState.totalCount, '');
	}
);

export const selectBillLogShowInitWaitingMessage = createSelector(
	selectBillLogState,
	billLogState => billLogState.showInitWaitingMessage
);

export const selectHasBillLogInStore = createSelector(
	selectBillLogState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
