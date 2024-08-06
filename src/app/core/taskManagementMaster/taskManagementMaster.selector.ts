import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
import { TaskManagementMasterState } from './taskManagementMaster.reducer';
import { each } from 'lodash';
import { TaskManagementMasterModel } from './taskManagementMaster.model';


export const selectTaskManagementMasterState = createFeatureSelector<TaskManagementMasterState>('taskManagementMaster');

export const selectTaskManagementMasterById = (taskManagementMasterId: string) => createSelector(
	selectTaskManagementMasterState,
	taskManagementMasterState =>  taskManagementMasterState.entities[taskManagementMasterId]
);

export const selectTaskManagementMasterPageLoading = createSelector(
	selectTaskManagementMasterState,
	taskManagementMasterState => {
		return taskManagementMasterState.listLoading;
	}
);

export const selectTaskManagementMasterActionLoading = createSelector(
	selectTaskManagementMasterState,
	taskManagementMasterState => taskManagementMasterState.actionsloading
);

export const selectLastCreatedTaskManagementMasterId = createSelector(
	selectTaskManagementMasterState,
	taskManagementMasterState => taskManagementMasterState.lastCreatedTaskManagementMasterId
);

export const selectTaskManagementMasterPageLastQuery = createSelector(
	selectTaskManagementMasterState,
	taskManagementMasterState => taskManagementMasterState.lastQuery
);

export const selectTaskManagementMasterInStore = createSelector(
	selectTaskManagementMasterState,
	taskManagementMasterState => {
		const items: TaskManagementMasterModel[] = [];
		each(taskManagementMasterState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: TaskManagementMasterModel[] = httpExtension.sortArray(items, taskManagementMasterState.lastQuery.sortField, taskManagementMasterState.lastQuery.sortOrder);
		return new QueryResultsModel(result, taskManagementMasterState.totalCount, '');
	}
);

export const selectTaskManagementMasterShowInitWaitingMessage = createSelector(
	selectTaskManagementMasterState,
	taskManagementMasterState => taskManagementMasterState.showInitWaitingMessage
);

export const selectHasTaskManagementMasterInStore = createSelector(
	selectTaskManagementMasterState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
