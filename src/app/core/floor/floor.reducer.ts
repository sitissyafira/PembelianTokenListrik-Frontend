// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { FloorActions, FloorActionTypes } from './floor.action';
// CRUD
import { QueryFloorModel } from './queryfloor.model';
// Models
import { FloorModel } from './floor.model';

// tslint:disable-next-line:no-empty-interface
export interface FloorState extends EntityState<FloorModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedFloorId: string;
	lastQuery: QueryFloorModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<FloorModel> = createEntityAdapter<FloorModel>(
	{ selectId: model => model._id, }
);

export const initialFloorState: FloorState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryFloorModel({}),
	lastCreatedFloorId: undefined,
	showInitWaitingMessage: true
});

export function floorReducer(state = initialFloorState, action: FloorActions): FloorState {
	switch  (action.type) {
		case FloorActionTypes.FloorPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedFloorId: undefined
		};
		case FloorActionTypes.FloorActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case FloorActionTypes.FloorOnServerCreated: return {
			...state
		};
		case FloorActionTypes.FloorCreated: return adapter.addOne(action.payload.floor, {
			...state, lastCreatedBlockId: action.payload.floor._id
		});
		case FloorActionTypes.FloorUpdated: return adapter.updateOne(action.payload.partialFloor, state);
		case FloorActionTypes.FloorDeleted: return adapter.removeOne(action.payload.id, state);
		case FloorActionTypes.FloorPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryFloorModel({})
		};
		case FloorActionTypes.FloorPageLoaded: {
			return adapter.addMany(action.payload.floor, {
				...initialFloorState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getFloorState = createFeatureSelector<FloorState>('floor');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
