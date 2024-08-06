
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { LocationBuildingActions, LocationBuildingActionTypes } from './locationBuilding.action';
import { LocationBuildingModel } from './locationBuilding.model';
import { QueryLocationBuildingModel } from './querylocationBuilding.model';

export interface LocationBuildingState extends EntityState<LocationBuildingModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedLocationBuildingId: string;
	lastQuery: QueryLocationBuildingModel;
	showInitWaitingMessage: boolean;
}
export const adapter: EntityAdapter<LocationBuildingModel> = createEntityAdapter<LocationBuildingModel>(
	{ selectId: model => model._id, }
);
export const initialLocationBuildingState: LocationBuildingState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryLocationBuildingModel({}),
	lastCreatedLocationBuildingId: undefined,
	showInitWaitingMessage: true
});
export function locationBuildingReducer(state = initialLocationBuildingState, action: LocationBuildingActions): LocationBuildingState {
	switch  (action.type) {
		case LocationBuildingActionTypes.LocationBuildingPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedLocationBuildingId: undefined
		};
		case LocationBuildingActionTypes.LocationBuildingActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case LocationBuildingActionTypes.LocationBuildingOnServerCreated: return {
			...state
		};
		case LocationBuildingActionTypes.LocationBuildingCreated: return adapter.addOne(action.payload.locationBuilding, {
			...state, lastCreatedBlockId: action.payload.locationBuilding._id
		});
		case LocationBuildingActionTypes.LocationBuildingUpdated: return adapter.updateOne(action.payload.partialLocationBuilding, state);
		case LocationBuildingActionTypes.LocationBuildingDeleted: return adapter.removeOne(action.payload.id, state);
		case LocationBuildingActionTypes.LocationBuildingPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryLocationBuildingModel({})
		};
		case LocationBuildingActionTypes.LocationBuildingPageLoaded: {
			return adapter.addMany(action.payload.locationBuilding, {
				...initialLocationBuildingState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}
export const getLocationBuildingState = createFeatureSelector<LocationBuildingState>('locationBuilding');
export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
