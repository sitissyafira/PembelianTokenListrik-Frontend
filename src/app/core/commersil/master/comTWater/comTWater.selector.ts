import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../../_base/crud';
import { ComTWaterState } from './comTWater.reducer';
import { each } from 'lodash';
import { ComTWaterModel } from './comTWater.model';


export const selectComTWaterState = createFeatureSelector<ComTWaterState>('comTWater');

export const selectComTWaterById = (comTWaterId: string) => createSelector(
	selectComTWaterState,
	comTWaterState =>  comTWaterState.entities[comTWaterId]
);
export const selectComTWaterPageLoading = createSelector(
	selectComTWaterState,
	comTWaterState => {
		return comTWaterState.listLoading;
	}
);
export const selectComTWaterActionLoading = createSelector(
	selectComTWaterState,
	comTWaterState => comTWaterState.actionsloading
);
export const selectLastCreatedComTWaterId = createSelector(
	selectComTWaterState,
	comTWaterState => comTWaterState.lastCreatedComTWaterId
);
export const selectComTWaterPageLastQuery = createSelector(
	selectComTWaterState,
	comTWaterState => comTWaterState.lastQuery
);
export const selectComTWaterInStore = createSelector(
	selectComTWaterState,
	comTWaterState => {
		const items: ComTWaterModel[] = [];
		each(comTWaterState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: ComTWaterModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, comTWaterState.totalCount, '');
	}
);
export const selectComTWaterShowInitWaitingMessage = createSelector(
	selectComTWaterState,
	comTWaterState => comTWaterState.showInitWaitingMessage
);
export const selectHasComTWaterInStore = createSelector(
	selectComTWaterState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
