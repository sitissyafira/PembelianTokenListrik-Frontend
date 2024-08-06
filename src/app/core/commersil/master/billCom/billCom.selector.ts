import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../../_base/crud';
import { BillComState } from './billCom.reducer';
import { each } from 'lodash';
import { BillComModel } from './billCom.model';


export const selectBillComState = createFeatureSelector<BillComState>('billCom');

export const selectBillComById = (billComId: string) => createSelector(
	selectBillComState,
	billComState =>  billComState.entities[billComId]
);
export const selectBillComPageLoading = createSelector(
	selectBillComState,
	billComState => {
		return billComState.listLoading;
	}
);
export const selectBillComActionLoading = createSelector(
	selectBillComState,
	billComState => billComState.actionsloading
);
export const selectLastCreatedBillComId = createSelector(
	selectBillComState,
	billComState => billComState.lastCreatedBillComId
);
export const selectBillComPageLastQuery = createSelector(
	selectBillComState,
	billComState => billComState.lastQuery
);
export const selectBillComInStore = createSelector(
	selectBillComState,
	billComState => {
		const items: BillComModel[] = [];
		each(billComState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: BillComModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, billComState.totalCount, '');
	}
);
export const selectBillComShowInitWaitingMessage = createSelector(
	selectBillComState,
	billComState => billComState.showInitWaitingMessage
);
export const selectHasBillComInStore = createSelector(
	selectBillComState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
