import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../../_base/crud';
import { ComPowerState } from './comPower.reducer';
import { each } from 'lodash';
import { ComPowerModel } from './comPower.model';


export const selectComPowerState = createFeatureSelector<ComPowerState>('comPower');

export const selectComPowerById = (comPowerId: string) => createSelector(
	selectComPowerState,
	comPowerState =>  comPowerState.entities[comPowerId]
);
export const selectComPowerPageLoading = createSelector(
	selectComPowerState,
	comPowerState => {
		return comPowerState.listLoading;
	}
);
export const selectComPowerActionLoading = createSelector(
	selectComPowerState,
	comPowerState => comPowerState.actionsloading
);
export const selectLastCreatedComPowerId = createSelector(
	selectComPowerState,
	comPowerState => comPowerState.lastCreatedComPowerId
);
export const selectComPowerPageLastQuery = createSelector(
	selectComPowerState,
	comPowerState => comPowerState.lastQuery
);
export const selectComPowerInStore = createSelector(
	selectComPowerState,
	comPowerState => {
		const items: ComPowerModel[] = [];
		each(comPowerState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: ComPowerModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, comPowerState.totalCount, '');
	}
);
export const selectComPowerShowInitWaitingMessage = createSelector(
	selectComPowerState,
	comPowerState => comPowerState.showInitWaitingMessage
);
export const selectHasComPowerInStore = createSelector(
	selectComPowerState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
