import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../../_base/crud';
import { ComUnitState } from './comUnit.reducer';
import { each } from 'lodash';
import { ComUnitModel } from './comUnit.model';


export const selectComUnitState = createFeatureSelector<ComUnitState>('comUnit');

export const selectComUnitById = (comUnitId: string) => createSelector(
	selectComUnitState,
	comUnitState =>  comUnitState.entities[comUnitId]
);
export const selectComUnitPageLoading = createSelector(
	selectComUnitState,
	comUnitState => {
		return comUnitState.listLoading;
	}
);
export const selectComUnitActionLoading = createSelector(
	selectComUnitState,
	comUnitState => comUnitState.actionsloading
);
export const selectLastCreatedComUnitId = createSelector(
	selectComUnitState,
	comUnitState => comUnitState.lastCreatedComUnitId
);
export const selectComUnitPageLastQuery = createSelector(
	selectComUnitState,
	comUnitState => comUnitState.lastQuery
);
export const selectComUnitInStore = createSelector(
	selectComUnitState,
	comUnitState => {
		const items: ComUnitModel[] = [];
		each(comUnitState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: ComUnitModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, comUnitState.totalCount, '');
	}
);
export const selectComUnitShowInitWaitingMessage = createSelector(
	selectComUnitState,
	comUnitState => comUnitState.showInitWaitingMessage
);
export const selectHasComUnitInStore = createSelector(
	selectComUnitState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
