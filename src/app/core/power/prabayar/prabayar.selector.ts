// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { PowerPrabayarState } from './prabayar.reducer';
import { each } from 'lodash';
import { PowerPrabayarModel } from './prabayar.model';


export const selectPowerPrabayarState = createFeatureSelector<PowerPrabayarState>('powerPrabayar');

export const selectPowerPrabayarById = (powerPrabayarId: string) => createSelector(
	selectPowerPrabayarState,
	powerPrabayarState =>  powerPrabayarState.entities[powerPrabayarId]
);

export const selectPowerPrabayarPageLoading = createSelector(
	selectPowerPrabayarState,
	powerPrabayarState => {
		return powerPrabayarState.listLoading;
	}
);

export const selectPowerPrabayarActionLoading = createSelector(
	selectPowerPrabayarState,
	powerPrabayarState => powerPrabayarState.actionsloading
);

export const selectLastCreatedPowerPrabayarId = createSelector(
	selectPowerPrabayarState,
	powerPrabayarState => powerPrabayarState.lastCreatedPowerPrabayarId
);

export const selectPowerPrabayarPageLastQuery = createSelector(
	selectPowerPrabayarState,
	powerPrabayarState => powerPrabayarState.lastQuery
);

export const selectPowerPrabayarInStore = createSelector(
	selectPowerPrabayarState,
	powerPrabayarState => {
		const items: PowerPrabayarModel[] = [];
		each(powerPrabayarState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: PowerPrabayarModel[] = httpExtension.sortArray(items, powerPrabayarState.lastQuery.sortField, powerPrabayarState.lastQuery.sortOrder);
		return new QueryResultsModel(result, powerPrabayarState.totalCount, '');
	}
);

export const selectPowerPrabayarShowInitWaitingMessage = createSelector(
	selectPowerPrabayarState,
	powerPrabayarState => powerPrabayarState.showInitWaitingMessage
);

export const selectHasPowerPrabayarInStore = createSelector(
	selectPowerPrabayarState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
