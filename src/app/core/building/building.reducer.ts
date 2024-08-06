// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { BuildingActions, BuildingActionTypes } from './building.action';
// CRUD
import { QueryBuildingModel } from './querybuilding.model';
// Models
import { BuildingModel } from './building.model';

// tslint:disable-next-line:no-empty-interface
export interface BuildingState extends EntityState<BuildingModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedBuildingId: string;
	lastQuery: QueryBuildingModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<BuildingModel> = createEntityAdapter<BuildingModel>(
	{ selectId: model => model._id, }
);

export const initialBuildingState: BuildingState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryBuildingModel({}),
	lastCreatedBuildingId: undefined,
	showInitWaitingMessage: true
});

export function buildingReducer(state = initialBuildingState, action: BuildingActions): BuildingState {
	switch  (action.type) {
		case BuildingActionTypes.BuildingPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedBuildingId: undefined
		};
		case BuildingActionTypes.BuildingActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case BuildingActionTypes.BuildingOnServerCreated: return {
			...state
		};
		case BuildingActionTypes.BuildingCreated: return adapter.addOne(action.payload.building, {
			...state, lastCreatedBlockId: action.payload.building._id
		});
		case BuildingActionTypes.BuildingUpdated: return adapter.updateOne(action.payload.partialBuilding, state);
		case BuildingActionTypes.BuildingDeleted: return adapter.removeOne(action.payload.id, state);
		case BuildingActionTypes.BuildingPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryBuildingModel({})
		};
		case BuildingActionTypes.BuildingPageLoaded: {
			return adapter.addMany(action.payload.building, {
				...initialBuildingState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getBuildingState = createFeatureSelector<BuildingState>('building');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
