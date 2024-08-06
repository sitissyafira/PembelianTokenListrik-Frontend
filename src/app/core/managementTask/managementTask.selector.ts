import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
import { ManagementTaskState } from './managementTask.reducer';
import { each } from 'lodash';
import { ManagementTaskModel } from './managementTask.model';


export const selectManagementTaskState = createFeatureSelector<ManagementTaskState>('managementTask');

export const selectManagementTaskById = (managementTaskId: string) => createSelector(
	selectManagementTaskState,
	managementTaskState =>  managementTaskState.entities[managementTaskId]
);

export const selectManagementTaskPageLoading = createSelector(
	selectManagementTaskState,
	managementTaskState => {
		return managementTaskState.listLoading;
	}
);

export const selectManagementTaskActionLoading = createSelector(
	selectManagementTaskState,
	managementTaskState => managementTaskState.actionsloading
);

export const selectLastCreatedManagementTaskId = createSelector(
	selectManagementTaskState,
	managementTaskState => managementTaskState.lastCreatedManagementTaskId
);

export const selectManagementTaskPageLastQuery = createSelector(
	selectManagementTaskState,
	managementTaskState => managementTaskState.lastQuery
);

export const selectManagementTaskInStore = createSelector(
	selectManagementTaskState,
	managementTaskState => {
		const items: ManagementTaskModel[] = [];
		each(managementTaskState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: ManagementTaskModel[] = httpExtension.sortArray(items, managementTaskState.lastQuery.sortField, managementTaskState.lastQuery.sortOrder);
		return new QueryResultsModel(result, managementTaskState.totalCount, '');
	}
);

export const selectManagementTaskShowInitWaitingMessage = createSelector(
	selectManagementTaskState,
	managementTaskState => managementTaskState.showInitWaitingMessage
);

export const selectHasManagementTaskInStore = createSelector(
	selectManagementTaskState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
