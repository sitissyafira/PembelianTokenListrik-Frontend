// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { AccountGroupState } from './accountGroup.reducer';
import { each } from 'lodash';
import { AccountGroupModel } from './accountGroup.model';


export const selectAccountGroupState = createFeatureSelector<AccountGroupState>('accountGroup');

export const selectAccountGroupById = (accountGroupId: string) => createSelector(
	selectAccountGroupState,
	accountGroupState =>  accountGroupState.entities[accountGroupId]
);

export const selectAccountGroupPageLoading = createSelector(
	selectAccountGroupState,
	accountGroupState => {
		return accountGroupState.listLoading;
	}
);

export const selectAccountGroupActionLoading = createSelector(
	selectAccountGroupState,
	accountGroupState => accountGroupState.actionsloading
);

export const selectLastCreatedAccountGroupId = createSelector(
	selectAccountGroupState,
	accountGroupState => accountGroupState.lastCreatedAccountGroupId
);

export const selectAccountGroupPageLastQuery = createSelector(
	selectAccountGroupState,
	accountGroupState => accountGroupState.lastQuery
);

export const selectAccountGroupInStore = createSelector(
	selectAccountGroupState,
	accountGroupState => {
		const items: AccountGroupModel[] = [];
		each(accountGroupState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: AccountGroupModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, accountGroupState.totalCount, '');
	}
);

export const selectAccountGroupShowInitWaitingMessage = createSelector(
	selectAccountGroupState,
	accountGroupState => accountGroupState.showInitWaitingMessage
);

export const selectHasAccountGroupInStore = createSelector(
	selectAccountGroupState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
