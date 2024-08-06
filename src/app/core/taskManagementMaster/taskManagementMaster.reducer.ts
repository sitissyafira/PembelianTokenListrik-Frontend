
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { TaskManagementMasterActions, TaskManagementMasterActionTypes } from './taskManagementMaster.action';

import { TaskManagementMasterModel } from './taskManagementMaster.model';
import { QueryTaskManagementMasterModel } from './querytaskManagementMaster.model';

export interface TaskManagementMasterState extends EntityState<TaskManagementMasterModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedTaskManagementMasterId: string;
	lastQuery: QueryTaskManagementMasterModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<TaskManagementMasterModel> = createEntityAdapter<TaskManagementMasterModel>(
	{ selectId: model => model._id, }
);

export const initialTaskManagementMasterState: TaskManagementMasterState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryTaskManagementMasterModel({}),
	lastCreatedTaskManagementMasterId: undefined,
	showInitWaitingMessage: true
});

export function taskManagementMasterReducer(state = initialTaskManagementMasterState, action: TaskManagementMasterActions): TaskManagementMasterState {
	switch  (action.type) {
		case TaskManagementMasterActionTypes.TaskManagementMasterPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedTaskManagementMasterId: undefined
		};
		case TaskManagementMasterActionTypes.TaskManagementMasterActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case TaskManagementMasterActionTypes.TaskManagementMasterOnServerCreated: return {
			...state
		};
		case TaskManagementMasterActionTypes.TaskManagementMasterCreated: return adapter.addOne(action.payload.taskManagementMaster, {
			...state, lastCreatedBlockId: action.payload.taskManagementMaster._id
		});
		case TaskManagementMasterActionTypes.TaskManagementMasterUpdated: return adapter.updateOne(action.payload.partialTaskManagementMaster, state);
		case TaskManagementMasterActionTypes.TaskManagementMasterDeleted: return adapter.removeOne(action.payload.id, state);
		case TaskManagementMasterActionTypes.TaskManagementMasterPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryTaskManagementMasterModel({})
		};
		case TaskManagementMasterActionTypes.TaskManagementMasterPageLoaded: {
			return adapter.addMany(action.payload.taskManagementMaster, {
				...initialTaskManagementMasterState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getTaskManagementMasterState = createFeatureSelector<TaskManagementMasterState>('taskManagementMaster');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
