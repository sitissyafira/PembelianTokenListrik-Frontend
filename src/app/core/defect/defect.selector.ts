// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { DefectState } from './defect.reducer';
import { each } from 'lodash';
import { DefectModel } from './defect.model';


export const selectDefectState = createFeatureSelector<DefectState>('defect');

export const selectDefectById = (defectId: string) => createSelector(
	selectDefectState,
	defectState =>  defectState.entities[defectId]
);

export const selectDefectPageLoading = createSelector(
	selectDefectState,
	defectState => {
		return defectState.listLoading;
	}
);

export const selectDefectActionLoading = createSelector(
	selectDefectState,
	defectState => defectState.actionsloading
);

export const selectLastCreatedDefectId = createSelector(
	selectDefectState,
	defectState => defectState.lastCreatedDefectId
);

export const selectDefectPageLastQuery = createSelector(
	selectDefectState,
	defectState => defectState.lastQuery
);

export const selectDefectInStore = createSelector(
	selectDefectState,
	defectState => {
		const items: DefectModel[] = [];
		each(defectState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: DefectModel[] = httpExtension.sortArray(items, defectState.lastQuery.sortField, defectState.lastQuery.sortOrder);
		return new QueryResultsModel(result, defectState.totalCount, '');
	}
);

export const selectDefectShowInitWaitingMessage = createSelector(
	selectDefectState,
	defectState => defectState.showInitWaitingMessage
);

export const selectHasDefectInStore = createSelector(
	selectDefectState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
