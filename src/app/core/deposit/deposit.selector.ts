// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { DepositState } from './deposit.reducer';
import { each } from 'lodash';
import { DepositModel } from './deposit.model';


export const selectDepositState = createFeatureSelector<DepositState>('deposit');

export const selectDepositById = (depositId: string) => createSelector(
	selectDepositState,
	depositState =>  depositState.entities[depositId]
);

export const selectDepositPageLoading = createSelector(
	selectDepositState,
	depositState => {
		return depositState.listLoading;
	}
);

export const selectDepositActionLoading = createSelector(
	selectDepositState,
	depositState => depositState.actionsloading
);

export const selectLastCreatedDepositId = createSelector(
	selectDepositState,
	depositState => depositState.lastCreatedDepositId
);

export const selectDepositPageLastQuery = createSelector(
	selectDepositState,
	depositState => depositState.lastQuery
);

export const selectDepositInStore = createSelector(
	selectDepositState,
	depositState => {
		const items: DepositModel[] = [];
		each(depositState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: DepositModel[] = httpExtension.sortArray(items, depositState.lastQuery.sortField, depositState.lastQuery.sortOrder);
		return new QueryResultsModel(result, depositState.totalCount, '');
	}
);

export const selectDepositShowInitWaitingMessage = createSelector(
	selectDepositState,
	depositState => depositState.showInitWaitingMessage
);

export const selectHasDepositGroupInStore = createSelector(
	selectDepositState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
