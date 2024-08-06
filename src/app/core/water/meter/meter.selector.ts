// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { WaterMeterState } from './meter.reducer';
import { each } from 'lodash';
import { WaterMeterModel } from './meter.model';


export const selectWaterMeterState = createFeatureSelector<WaterMeterState>('waterMeter');

export const selectWaterMeterById = (waterMeterId: string) => createSelector(
	selectWaterMeterState,
	waterMeterState =>  waterMeterState.entities[waterMeterId]
);

export const selectWaterMeterPageLoading = createSelector(
	selectWaterMeterState,
	waterMeterState => {
		return waterMeterState.listLoading;
	}
);

export const selectWaterMeterActionLoading = createSelector(
	selectWaterMeterState,
	waterMeterState => waterMeterState.actionsloading
);

export const selectLastCreatedWaterMeterId = createSelector(
	selectWaterMeterState,
	waterMeterState => waterMeterState.lastCreatedWaterMeterId
);

export const selectWaterMeterPageLastQuery = createSelector(
	selectWaterMeterState,
	waterMeterState => waterMeterState.lastQuery
);

export const selectWaterMeterInStore = createSelector(
	selectWaterMeterState,
	waterMeterState => {
		const items: WaterMeterModel[] = [];
		each(waterMeterState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: WaterMeterModel[] = httpExtension.sortArray(items, waterMeterState.lastQuery.sortField, waterMeterState.lastQuery.sortOrder);
		return new QueryResultsModel(result, waterMeterState.totalCount, '');
	}
);

export const selectWaterMeterShowInitWaitingMessage = createSelector(
	selectWaterMeterState,
	waterMeterState => waterMeterState.showInitWaitingMessage
);

export const selectHasWaterMeterInStore = createSelector(
	selectWaterMeterState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
