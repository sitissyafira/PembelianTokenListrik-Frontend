// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { AccountCategoryState } from './accountCategory.reducer';
import { each } from 'lodash';
import { AccountCategoryModel } from './accountCategory.model';

export const selectAccountCategoryState = createFeatureSelector<AccountCategoryState>('accountCategory');

export const selectAccountCategoryById = (accountCategoryId: string) => createSelector(
	selectAccountCategoryState,
	accountCategoryState =>  accountCategoryState.entities[accountCategoryId]
);

export const selectAccountCategoryPageLoading = createSelector(
	selectAccountCategoryState,
	accountCategoryState => {
		return accountCategoryState.listLoading;
	}
);

export const selectAccountCategoryActionLoading = createSelector(
	selectAccountCategoryState,
	accountCategoryState => accountCategoryState.actionsloading
);

export const selectLastCreatedAccountCategoryId = createSelector(
	selectAccountCategoryState,
	accountCategoryState => accountCategoryState.lastCreatedAccountCategoryId
);

export const selectAccountCategoryPageLastQuery = createSelector(
	selectAccountCategoryState,
	accountCategoryState => accountCategoryState.lastQuery
);

export const selectAccountCategoryInStore = createSelector(
	selectAccountCategoryState,
	accountCategoryState => {
		const items: AccountCategoryModel[] = [];
		each(accountCategoryState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: AccountCategoryModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, accountCategoryState.totalCount, '');
	}
);

export const selectAccountCategoryShowInitWaitingMessage = createSelector(
	selectAccountCategoryState,
	accountCategoryState => accountCategoryState.showInitWaitingMessage
);

export const selectHasAccountCategoryInStore = createSelector(
	selectAccountCategoryState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
