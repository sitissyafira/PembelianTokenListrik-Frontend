// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../../_base/crud';
// State
import { AccountBankState } from './accountBank.reducer';
import { each } from 'lodash';
import { AccountBankModel } from './accountBank.model';


export const selectAccountBankState = createFeatureSelector<AccountBankState>('accountBank');

export const selectAccountBankById = (accountBankId: string) => createSelector(
	selectAccountBankState,
	accountBankState =>  accountBankState.entities[accountBankId]
);

export const selectAccountBankPageLoading = createSelector(
	selectAccountBankState,
	accountBankState => {
		return accountBankState.listLoading;
	}
);

export const selectAccountBankActionLoading = createSelector(
	selectAccountBankState,
	accountBankState => accountBankState.actionsloading
);

export const selectLastCreatedAccountBankId = createSelector(
	selectAccountBankState,
	accountBankState => accountBankState.lastCreatedAccountBankId
);

export const selectAccountBankPageLastQuery = createSelector(
	selectAccountBankState,
	accountBankState => accountBankState.lastQuery
);

export const selectAccountBankInStore = createSelector(
	selectAccountBankState,
	accountBankState => {
		const items: AccountBankModel[] = [];
		each(accountBankState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: AccountBankModel[] = httpExtension.sortArray(items, accountBankState.lastQuery.sortField, accountBankState.lastQuery.sortOrder);
		return new QueryResultsModel(result, accountBankState.totalCount, '');
	}
);

export const selectAccountBankShowInitWaitingMessage = createSelector(
	selectAccountBankState,
	accountBankState => accountBankState.showInitWaitingMessage
);

export const selectHasAccountBankInStore = createSelector(
	selectAccountBankState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
