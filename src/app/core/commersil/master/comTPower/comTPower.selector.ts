import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../../_base/crud';
import { ComTPowerState } from './comTPower.reducer';
import { each } from 'lodash';
import { ComTPowerModel } from './comTPower.model';


export const selectComTPowerState = createFeatureSelector<ComTPowerState>('comTPower');

export const selectComTPowerById = (comTPowerId: string) => createSelector(
	selectComTPowerState,
	comTPowerState =>  comTPowerState.entities[comTPowerId]
);
export const selectComTPowerPageLoading = createSelector(
	selectComTPowerState,
	comTPowerState => {
		return comTPowerState.listLoading;
	}
);
export const selectComTPowerActionLoading = createSelector(
	selectComTPowerState,
	comTPowerState => comTPowerState.actionsloading
);
export const selectLastCreatedComTPowerId = createSelector(
	selectComTPowerState,
	comTPowerState => comTPowerState.lastCreatedComTPowerId
);
export const selectComTPowerPageLastQuery = createSelector(
	selectComTPowerState,
	comTPowerState => comTPowerState.lastQuery
);
export const selectComTPowerInStore = createSelector(
	selectComTPowerState,
	comTPowerState => {
		const items: ComTPowerModel[] = [];
		each(comTPowerState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: ComTPowerModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, comTPowerState.totalCount, '');
	}
);
export const selectComTPowerShowInitWaitingMessage = createSelector(
	selectComTPowerState,
	comTPowerState => comTPowerState.showInitWaitingMessage
);
export const selectHasComTPowerInStore = createSelector(
	selectComTPowerState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
