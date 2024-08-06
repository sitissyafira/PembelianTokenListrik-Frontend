// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { TransactionsState } from './transactions.reducer';
import { each } from 'lodash';
import { TransactionsModel } from './transactions.model';

export const selectTransactionsState = createFeatureSelector<TransactionsState>('transactions');

export const selectTransactionsById = (transactionsId: string) => createSelector(
	selectTransactionsState,
	transactionsState => transactionsState.entities[transactionsId]
);

export const selectTransactionsPageLoading = createSelector(
	selectTransactionsState,
	transactionsState => {
		return transactionsState.listLoading;
	}
);

export const selectTransactionsActionLoading = createSelector(
	selectTransactionsState,
	transactionsState => transactionsState.actionsloading
);

export const selectLastCreatedTransactionsId = createSelector(
	selectTransactionsState,
	transactionsState => transactionsState.lastCreatedTransactionsId
);

export const selectTransactionsPageLastQuery = createSelector(
	selectTransactionsState,
	transactionsState => transactionsState.lastQuery
);

export const selectTransactionsInStore = createSelector(
	selectTransactionsState,
	transactionsState => {
		const items: TransactionsModel[] = [];
		each(transactionsState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: TransactionsModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, transactionsState.totalCount, '');
	}
);

export const selectTransactionsShowInitWaitingMessage = createSelector(
	selectTransactionsState,
	transactionsState => transactionsState.showInitWaitingMessage
);

export const selectHasTransactionsInStore = createSelector(
	selectTransactionsState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
