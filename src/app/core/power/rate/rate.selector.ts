// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { PowerRateState } from './rate.reducer';
import { each } from 'lodash';
import { PowerRateModel } from './rate.model';


export const selectPowerRateState = createFeatureSelector<PowerRateState>('powerRate');

export const selectPowerRateById = (powerRateId: string) => createSelector(
	selectPowerRateState,
	powerRateState =>  powerRateState.entities[powerRateId]
);

export const selectPowerRatePageLoading = createSelector(
	selectPowerRateState,
	powerRateState => {
		return powerRateState.listLoading;
	}
);

export const selectPowerRateActionLoading = createSelector(
	selectPowerRateState,
	powerRateState => powerRateState.actionsloading
);

export const selectLastCreatedPowerRateId = createSelector(
	selectPowerRateState,
	powerRateState => powerRateState.lastCreatedPowerRateId
);

export const selectPowerRatePageLastQuery = createSelector(
	selectPowerRateState,
	powerRateState => powerRateState.lastQuery
);

export const selectPowerRateInStore = createSelector(
	selectPowerRateState,
	powerRateState => {
		const items: PowerRateModel[] = [];
		each(powerRateState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: PowerRateModel[] = httpExtension.sortArray(items, powerRateState.lastQuery.sortField, powerRateState.lastQuery.sortOrder);
		return new QueryResultsModel(result, powerRateState.totalCount, '');
	}
);

export const selectPowerRateShowInitWaitingMessage = createSelector(
	selectPowerRateState,
	powerRateState => powerRateState.showInitWaitingMessage
);

export const selectHasPowerRateInStore = createSelector(
	selectPowerRateState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
