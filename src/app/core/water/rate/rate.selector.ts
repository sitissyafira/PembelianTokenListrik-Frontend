// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { WaterRateState } from './rate.reducer';
import { each } from 'lodash';
import { WaterRateModel } from './rate.model';


export const selectWaterRateState = createFeatureSelector<WaterRateState>('waterRate');

export const selectWaterRateById = (waterRateId: string) => createSelector(
	selectWaterRateState,
	waterRateState =>  waterRateState.entities[waterRateId]
);

export const selectWaterRatePageLoading = createSelector(
	selectWaterRateState,
	waterRateState => {
		return waterRateState.listLoading;
	}
);

export const selectWaterRateActionLoading = createSelector(
	selectWaterRateState,
	waterRateState => waterRateState.actionsloading
);

export const selectLastCreatedWaterRateId = createSelector(
	selectWaterRateState,
	waterRateState => waterRateState.lastCreatedWaterRateId
);

export const selectWaterRatePageLastQuery = createSelector(
	selectWaterRateState,
	waterRateState => waterRateState.lastQuery
);

export const selectWaterRateInStore = createSelector(
	selectWaterRateState,
	waterRateState => {
		const items: WaterRateModel[] = [];
		each(waterRateState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: WaterRateModel[] = httpExtension.sortArray(items, waterRateState.lastQuery.sortField, waterRateState.lastQuery.sortOrder);
		return new QueryResultsModel(result, waterRateState.totalCount, '');
	}
);

export const selectWaterRateShowInitWaitingMessage = createSelector(
	selectWaterRateState,
	waterRateState => waterRateState.showInitWaitingMessage
);

export const selectHasWaterRateInStore = createSelector(
	selectWaterRateState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
