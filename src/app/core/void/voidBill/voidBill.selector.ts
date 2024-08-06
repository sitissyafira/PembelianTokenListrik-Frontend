// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { VoidBillState } from './voidBill.reducer';
import { each } from 'lodash';
import { VoidBillModel } from './voidBill.model';


export const selectVoidBillState = createFeatureSelector<VoidBillState>('voidBill');

export const selectVoidBillById = (voidBillId: string) => createSelector(
	selectVoidBillState,
	voidBillState => voidBillState.entities[voidBillId]
);

export const selectVoidBillPageLoading = createSelector(
	selectVoidBillState,
	voidBillState => {
		return voidBillState.listLoading;
	}
);

export const selectVoidBillActionLoading = createSelector(
	selectVoidBillState,
	voidBillState => voidBillState.actionsloading
);

export const selectLastCreatedVoidBillId = createSelector(
	selectVoidBillState,
	voidBillState => voidBillState.lastCreatedVoidBillId
);

export const selectVoidBillPageLastQuery = createSelector(
	selectVoidBillState,
	voidBillState => voidBillState.lastQuery
);

export const selectVoidBillInStore = createSelector(
	selectVoidBillState,
	voidBillState => {
		const items: VoidBillModel[] = [];
		each(voidBillState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: VoidBillModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, voidBillState.totalCount, '');
	}
);

export const selectVoidBillShowInitWaitingMessage = createSelector(
	selectVoidBillState,
	voidBillState => voidBillState.showInitWaitingMessage
);

export const selectHasVoidBillGroupInStore = createSelector(
	selectVoidBillState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
