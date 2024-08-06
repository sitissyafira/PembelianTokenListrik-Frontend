// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { AccountHistoryState } from './accountHistory.reducer';
import { each } from 'lodash';
import { AccountHistoryModel } from './accountHistory.model';

export const selectAccountHistoryState = createFeatureSelector<AccountHistoryState>('accountHistory');

export const selectAccountHistoryById = (accountHistoryId: string) => createSelector(
	selectAccountHistoryState,
	accountHistoryState =>  accountHistoryState.entities[accountHistoryId]
);

export const selectAccountHistoryPageLoading = createSelector(
	selectAccountHistoryState,
	accountHistoryState => {
		return accountHistoryState.listLoading;
	}
);

export const selectAccountHistoryActionLoading = createSelector(
	selectAccountHistoryState,
	accountHistoryState => accountHistoryState.actionsloading
);

export const selectLastCreatedAccountHistoryId = createSelector(
	selectAccountHistoryState,
	accountHistoryState => accountHistoryState.lastCreatedAccountHistoryId
);

export const selectAccountHistoryPageLastQuery = createSelector(
	selectAccountHistoryState,
	accountHistoryState => accountHistoryState.lastQuery
);

export const selectAccountHistoryInStore = createSelector(
	selectAccountHistoryState,
	accountHistoryState => {
		const items: AccountHistoryModel[] = [];
		each(accountHistoryState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: AccountHistoryModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, accountHistoryState.totalCount, '');
	}
);

export const selectAccountHistoryShowInitWaitingMessage = createSelector(
	selectAccountHistoryState,
	accountHistoryState => accountHistoryState.showInitWaitingMessage
);

export const selectHasAccountHistoryInStore = createSelector(
	selectAccountHistoryState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
