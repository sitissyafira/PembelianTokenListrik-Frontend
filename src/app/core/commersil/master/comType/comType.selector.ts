import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../../_base/crud';
import { ComTypeState } from './comType.reducer';
import { each } from 'lodash';
import { ComTypeModel } from './comType.model';


export const selectComTypeState = createFeatureSelector<ComTypeState>('comType');

export const selectComTypeById = (comTypeId: string) => createSelector(
	selectComTypeState,
	comTypeState =>  comTypeState.entities[comTypeId]
);
export const selectComTypePageLoading = createSelector(
	selectComTypeState,
	comTypeState => {
		return comTypeState.listLoading;
	}
);
export const selectComTypeActionLoading = createSelector(
	selectComTypeState,
	comTypeState => comTypeState.actionsloading
);
export const selectLastCreatedComTypeId = createSelector(
	selectComTypeState,
	comTypeState => comTypeState.lastCreatedComTypeId
);
export const selectComTypePageLastQuery = createSelector(
	selectComTypeState,
	comTypeState => comTypeState.lastQuery
);
export const selectComTypeInStore = createSelector(
	selectComTypeState,
	comTypeState => {
		const items: ComTypeModel[] = [];
		each(comTypeState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: ComTypeModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, comTypeState.totalCount, '');
	}
);
export const selectComTypeShowInitWaitingMessage = createSelector(
	selectComTypeState,
	comTypeState => comTypeState.showInitWaitingMessage
);
export const selectHasComTypeInStore = createSelector(
	selectComTypeState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
