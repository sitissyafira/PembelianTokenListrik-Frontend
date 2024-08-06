// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { SubdefectState } from './subdefect.reducer';
import { each } from 'lodash';
import { SubdefectModel } from './subdefect.model';


export const selectSubdefectState = createFeatureSelector<SubdefectState>('subdefect');

export const selectSubdefectById = (subdefectId: string) => createSelector(
	selectSubdefectState,
	subdefectState =>  subdefectState.entities[subdefectId]
);

export const selectSubdefectPageLoading = createSelector(
	selectSubdefectState,
	subdefectState => {
		return subdefectState.listLoading;
	}
);

export const selectSubdefectActionLoading = createSelector(
	selectSubdefectState,
	subdefectState => subdefectState.actionsloading
);

export const selectLastCreatedSubdefectId = createSelector(
	selectSubdefectState,
	subdefectState => subdefectState.lastCreatedSubdefectId
);

export const selectSubdefectPageLastQuery = createSelector(
	selectSubdefectState,
	subdefectState => subdefectState.lastQuery
);

export const selectSubdefectInStore = createSelector(
	selectSubdefectState,
	subdefectState => {
		const items: SubdefectModel[] = [];
		each(subdefectState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: SubdefectModel[] = httpExtension.sortArray(items, subdefectState.lastQuery.sortField, subdefectState.lastQuery.sortOrder);
		return new QueryResultsModel(result, subdefectState.totalCount, '');
	}
);

export const selectSubdefectShowInitWaitingMessage = createSelector(
	selectSubdefectState,
	subdefectState => subdefectState.showInitWaitingMessage
);

export const selectHasSubdefectInStore = createSelector(
	selectSubdefectState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
