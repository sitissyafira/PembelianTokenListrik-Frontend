import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../../_base/crud';
import { ComWaterState } from './comWater.reducer';
import { each } from 'lodash';
import { ComWaterModel } from './comWater.model';


export const selectComWaterState = createFeatureSelector<ComWaterState>('comWater');

export const selectComWaterById = (comWaterId: string) => createSelector(
	selectComWaterState,
	comWaterState =>  comWaterState.entities[comWaterId]
);
export const selectComWaterPageLoading = createSelector(
	selectComWaterState,
	comWaterState => {
		return comWaterState.listLoading;
	}
);
export const selectComWaterActionLoading = createSelector(
	selectComWaterState,
	comWaterState => comWaterState.actionsloading
);
export const selectLastCreatedComWaterId = createSelector(
	selectComWaterState,
	comWaterState => comWaterState.lastCreatedComWaterId
);
export const selectComWaterPageLastQuery = createSelector(
	selectComWaterState,
	comWaterState => comWaterState.lastQuery
);
export const selectComWaterInStore = createSelector(
	selectComWaterState,
	comWaterState => {
		const items: ComWaterModel[] = [];
		each(comWaterState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: ComWaterModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, comWaterState.totalCount, '');
	}
);
export const selectComWaterShowInitWaitingMessage = createSelector(
	selectComWaterState,
	comWaterState => comWaterState.showInitWaitingMessage
);
export const selectHasComWaterInStore = createSelector(
	selectComWaterState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
