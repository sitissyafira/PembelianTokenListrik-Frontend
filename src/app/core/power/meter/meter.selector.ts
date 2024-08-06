// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { PowerMeterState } from './meter.reducer';
import { each } from 'lodash';
import { PowerMeterModel } from './meter.model';


export const selectPowerMeterState = createFeatureSelector<PowerMeterState>('powerMeter');

export const selectPowerMeterById = (powerMeterId: string) => createSelector(
	selectPowerMeterState,
	powerMeterState =>  powerMeterState.entities[powerMeterId]
);

export const selectPowerMeterPageLoading = createSelector(
	selectPowerMeterState,
	powerMeterState => {
		return powerMeterState.listLoading;
	}
);

export const selectPowerMeterActionLoading = createSelector(
	selectPowerMeterState,
	powerMeterState => powerMeterState.actionsloading
);

export const selectLastCreatedPowerMeterId = createSelector(
	selectPowerMeterState,
	powerMeterState => powerMeterState.lastCreatedPowerMeterId
);

export const selectPowerMeterPageLastQuery = createSelector(
	selectPowerMeterState,
	powerMeterState => powerMeterState.lastQuery
);

export const selectPowerMeterInStore = createSelector(
	selectPowerMeterState,
	powerMeterState => {
		const items: PowerMeterModel[] = [];
		each(powerMeterState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: PowerMeterModel[] = httpExtension.sortArray(items, powerMeterState.lastQuery.sortField, powerMeterState.lastQuery.sortOrder);
		return new QueryResultsModel(result, powerMeterState.totalCount, '');
	}
);

export const selectPowerMeterShowInitWaitingMessage = createSelector(
	selectPowerMeterState,
	powerMeterState => powerMeterState.showInitWaitingMessage
);

export const selectHasPowerMeterInStore = createSelector(
	selectPowerMeterState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
