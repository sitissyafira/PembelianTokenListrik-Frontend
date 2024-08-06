// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { GasRateState } from './rate.reducer';
import { each } from 'lodash';
import { GasRateModel } from './rate.model';


export const selectGasRateState = createFeatureSelector<GasRateState>('gasRate');

export const selectGasRateById = (gasRateId: string) => createSelector(
	selectGasRateState,
	gasRateState =>  gasRateState.entities[gasRateId]
);

export const selectGasRatePageLoading = createSelector(
	selectGasRateState,
	gasRateState => {
		return gasRateState.listLoading;
	}
);

export const selectGasRateActionLoading = createSelector(
	selectGasRateState,
	gasRateState => gasRateState.actionsloading
);

export const selectLastCreatedGasRateId = createSelector(
	selectGasRateState,
	gasRateState => gasRateState.lastCreatedGasRateId
);

export const selectGasRatePageLastQuery = createSelector(
	selectGasRateState,
	gasRateState => gasRateState.lastQuery
);


export const selectGasRateInStore = createSelector(
	selectGasRateState,
	gasRateState => {
		const items: GasRateModel[] = [];
		each(gasRateState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: GasRateModel[] = httpExtension.sortArray(items, gasRateState.lastQuery.sortField, gasRateState.lastQuery.sortOrder);
		return new QueryResultsModel(result, gasRateState.totalCount, '');
	}
);

export const selectGasRateShowInitWaitingMessage = createSelector(
	selectGasRateState,
	gasRateState => gasRateState.showInitWaitingMessage
);

export const selectHasGasRateInStore = createSelector(
	selectGasRateState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
