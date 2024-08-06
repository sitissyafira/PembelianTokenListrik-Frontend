// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { FacilityActions, FacilityActionTypes } from './facility.action';
// CRUD

// Models
import { FacilityModel } from './facility.model';
import { QueryFacilityModel } from './queryfacility.model';

// tslint:disable-next-line:no-empty-interface
export interface FacilityState extends EntityState<FacilityModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedFacilityId: string;
	lastQuery: QueryFacilityModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<FacilityModel> = createEntityAdapter<FacilityModel>(
	{ selectId: model => model._id, }
);

export const initialFacilityState: FacilityState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryFacilityModel({}),
	lastCreatedFacilityId: undefined,
	showInitWaitingMessage: true
});

export function facilityReducer(state = initialFacilityState, action: FacilityActions): FacilityState {
	switch  (action.type) {
		case FacilityActionTypes.FacilityPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedFacilityId: undefined
		};
		case FacilityActionTypes.FacilityActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case FacilityActionTypes.FacilityOnServerCreated: return {
			...state
		};
		case FacilityActionTypes.FacilityCreated: return adapter.addOne(action.payload.facility, {
			...state, lastCreatedBlockId: action.payload.facility._id
		});
		case FacilityActionTypes.FacilityUpdated: return adapter.updateOne(action.payload.partialFacility, state);
		case FacilityActionTypes.FacilityDeleted: return adapter.removeOne(action.payload.id, state);
		case FacilityActionTypes.FacilityPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryFacilityModel({})
		};
		case FacilityActionTypes.FacilityPageLoaded: {
			return adapter.addMany(action.payload.facility, {
				...initialFacilityState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getFacilityState = createFeatureSelector<FacilityState>('facility');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
