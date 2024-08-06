
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { ManagementTaskActions, ManagementTaskActionTypes } from './managementTask.action';

import { ManagementTaskModel } from './managementTask.model';
import { QueryManagementTaskModel } from './querymanagementTask.model';

export interface ManagementTaskState extends EntityState<ManagementTaskModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedManagementTaskId: string;
	lastQuery: QueryManagementTaskModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<ManagementTaskModel> = createEntityAdapter<ManagementTaskModel>(
	{ selectId: model => model._id, }
);

export const initialManagementTaskState: ManagementTaskState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryManagementTaskModel({}),
	lastCreatedManagementTaskId: undefined,
	showInitWaitingMessage: true
});

export function managementTaskReducer(state = initialManagementTaskState, action: ManagementTaskActions): ManagementTaskState {
	switch  (action.type) {
		case ManagementTaskActionTypes.ManagementTaskPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedManagementTaskId: undefined
		};
		case ManagementTaskActionTypes.ManagementTaskActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case ManagementTaskActionTypes.ManagementTaskOnServerCreated: return {
			...state
		};
		case ManagementTaskActionTypes.ManagementTaskCreated: return adapter.addOne(action.payload.managementTask, {
			...state, lastCreatedBlockId: action.payload.managementTask._id
		});
		case ManagementTaskActionTypes.ManagementTaskUpdated: return adapter.updateOne(action.payload.partialManagementTask, state);
		case ManagementTaskActionTypes.ManagementTaskDeleted: return adapter.removeOne(action.payload.id, state);
		case ManagementTaskActionTypes.ManagementTaskPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryManagementTaskModel({})
		};
		case ManagementTaskActionTypes.ManagementTaskPageLoaded: {
			return adapter.addMany(action.payload.managementTask, {
				...initialManagementTaskState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getManagementTaskState = createFeatureSelector<ManagementTaskState>('managementTask');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
