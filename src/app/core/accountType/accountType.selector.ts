// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { AccountTypeState } from './accountType.reducer';
import { each } from 'lodash';
import { AccountTypeModel } from './accountType.model';


export const selectAccountTypeState = createFeatureSelector<AccountTypeState>('accountType');

export const selectAccountTypeById = (accountTypeId: string) => createSelector(
	selectAccountTypeState,
	accountTypeState =>  accountTypeState.entities[accountTypeId]
);

export const selectAccountTypePageLoading = createSelector(
	selectAccountTypeState,
	accountTypeState => {
		return accountTypeState.listLoading;
	}
);

export const selectAccountTypeActionLoading = createSelector(
	selectAccountTypeState,
	accountTypeState => accountTypeState.actionsloading
);

export const selectLastCreatedAccountTypeId = createSelector(
	selectAccountTypeState,
	accountTypeState => accountTypeState.lastCreatedAccountTypeId
);

export const selectAccountTypePageLastQuery = createSelector(
	selectAccountTypeState,
	accountTypeState => accountTypeState.lastQuery
);

export const selectAccountTypeInStore = createSelector(
	selectAccountTypeState,
	accountTypeState => {
		const items: AccountTypeModel[] = [];
		each(accountTypeState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: AccountTypeModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, accountTypeState.totalCount, '');
	}
);

export const selectAccountTypeShowInitWaitingMessage = createSelector(
	selectAccountTypeState,
	accountTypeState => accountTypeState.showInitWaitingMessage
);

export const selectHasAccountTypeInStore = createSelector(
	selectAccountTypeState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
