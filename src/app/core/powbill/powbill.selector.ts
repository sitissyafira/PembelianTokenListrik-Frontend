// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { PowbillState } from './powbill.reducer';
import { each } from 'lodash';
import { PowbillModel } from './powbill.model';


export const selectPowbillState = createFeatureSelector<PowbillState>('powbill');

export const selectPowbillById = (powbillId: string) => createSelector(
	selectPowbillState,
	powbillState =>  powbillState.entities[powbillId]
);

export const selectPowbillPageLoading = createSelector(
	selectPowbillState,
	powbillState => {
		return powbillState.listLoading;
	}
);

export const selectPowbillActionLoading = createSelector(
	selectPowbillState,
	powbillState => powbillState.actionsloading
);

export const selectLastCreatedPowbillId = createSelector(
	selectPowbillState,
	powbillState => powbillState.lastCreatedPowbillId
);

export const selectPowbillPageLastQuery = createSelector(
	selectPowbillState,
	powbillState => powbillState.lastQuery
);

export const selectPowbillInStore = createSelector(
	selectPowbillState,
	powbillState => {
		const items: PowbillModel[] = [];
		each(powbillState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: PowbillModel[] = httpExtension.sortArray(items, powbillState.lastQuery.sortField, powbillState.lastQuery.sortOrder);
		return new QueryResultsModel(result, powbillState.totalCount, '');
	}
);

export const selectPowbillShowInitWaitingMessage = createSelector(
	selectPowbillState,
	powbillState => powbillState.showInitWaitingMessage
);

export const selectHasPowbillInStore = createSelector(
	selectPowbillState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
