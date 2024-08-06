
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { CheckpointActions, CheckpointActionTypes } from './checkpoint.action';
import { CheckpointModel } from './checkpoint.model';
import { QueryCheckpointModel } from './querycheckpoint.model';

export interface CheckpointState extends EntityState<CheckpointModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedCheckpointId: string;
	lastQuery: QueryCheckpointModel;
	showInitWaitingMessage: boolean;
}
export const adapter: EntityAdapter<CheckpointModel> = createEntityAdapter<CheckpointModel>(
	{ selectId: model => model._id, }
);
export const initialCheckpointState: CheckpointState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryCheckpointModel({}),
	lastCreatedCheckpointId: undefined,
	showInitWaitingMessage: true
});
export function checkpointReducer(state = initialCheckpointState, action: CheckpointActions): CheckpointState {
	switch  (action.type) {
		case CheckpointActionTypes.CheckpointPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedCheckpointId: undefined
		};
		case CheckpointActionTypes.CheckpointActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case CheckpointActionTypes.CheckpointOnServerCreated: return {
			...state
		};
		case CheckpointActionTypes.CheckpointCreated: return adapter.addOne(action.payload.checkpoint, {
			...state, lastCreatedBlockId: action.payload.checkpoint._id
		});
		case CheckpointActionTypes.CheckpointUpdated: return adapter.updateOne(action.payload.partialCheckpoint, state);
		case CheckpointActionTypes.CheckpointDeleted: return adapter.removeOne(action.payload.id, state);
		case CheckpointActionTypes.CheckpointPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryCheckpointModel({})
		};
		case CheckpointActionTypes.CheckpointPageLoaded: {
			return adapter.addMany(action.payload.checkpoint, {
				...initialCheckpointState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}
export const getCheckpointState = createFeatureSelector<CheckpointState>('checkpoint');
export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
