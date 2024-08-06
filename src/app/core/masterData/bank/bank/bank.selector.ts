// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../../_base/crud';
// State
import { BankState } from './bank.reducer';
import { each } from 'lodash';
import { BankModel } from './bank.model';


export const selectBankState = createFeatureSelector<BankState>('bank');

export const selectBankById = (bankId: string) => createSelector(
	selectBankState,
	bankState =>  bankState.entities[bankId]
);

export const selectBankPageLoading = createSelector(
	selectBankState,
	bankState => {
		return bankState.listLoading;
	}
);

export const selectBankActionLoading = createSelector(
	selectBankState,
	bankState => bankState.actionsloading
);

export const selectLastCreatedBankId = createSelector(
	selectBankState,
	bankState => bankState.lastCreatedBankId
);

export const selectBankPageLastQuery = createSelector(
	selectBankState,
	bankState => bankState.lastQuery
);

export const selectBankInStore = createSelector(
	selectBankState,
	bankState => {
		const items: BankModel[] = [];
		each(bankState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: BankModel[] = httpExtension.sortArray(items, bankState.lastQuery.sortField, bankState.lastQuery.sortOrder);
		return new QueryResultsModel(result, bankState.totalCount, '');
	}
);

export const selectBankShowInitWaitingMessage = createSelector(
	selectBankState,
	bankState => bankState.showInitWaitingMessage
);

export const selectHasBankInStore = createSelector(
	selectBankState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
