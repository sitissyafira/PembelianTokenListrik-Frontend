// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { GasTransactionState } from './transaction.reducer';
import { each } from 'lodash';
import { GasTransactionModel } from './transaction.model';


export const selectGasTransactionState = createFeatureSelector<GasTransactionState>('gasTransaction');

export const selectGasTransactionById = (gasTransactionId: string) => createSelector(
	selectGasTransactionState,
	gasTransactionState =>  gasTransactionState.entities[gasTransactionId]
);

export const selectGasTransactionPageLoading = createSelector(
	selectGasTransactionState,
	gasTransactionState => {
		return gasTransactionState.listLoading;
	}
);

export const selectGasTransactionActionLoading = createSelector(
	selectGasTransactionState,
	gasTransactionState => gasTransactionState.actionsloading
);

export const selectLastCreatedGasTransactionId = createSelector(
	selectGasTransactionState,
	gasTransactionState => gasTransactionState.lastCreatedGasTransactionId
);

export const selectGasTransactionPageLastQuery = createSelector(
	selectGasTransactionState,
	gasTransactionState => gasTransactionState.lastQuery
);

export const selectGasTransactionInStore = createSelector(
	selectGasTransactionState,
	gasTransactionState => {
		const items: GasTransactionModel[] = [];
		each(gasTransactionState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: GasTransactionModel[] = httpExtension.sortArray(items, gasTransactionState.lastQuery.sortField, gasTransactionState.lastQuery.sortOrder);
		return new QueryResultsModel(result, gasTransactionState.totalCount, '');
	}
);

export const selectGasTransactionShowInitWaitingMessage = createSelector(
	selectGasTransactionState,
	gasTransactionState => gasTransactionState.showInitWaitingMessage
);

export const selectHasGasTransactionInStore = createSelector(
	selectGasTransactionState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
