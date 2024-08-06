// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { ParkingActions, ParkingActionTypes } from './parking.action';
// CRUD

// Models
import { ParkingModel } from './parking.model';
import { QueryParkingModel } from './queryparking.model';

// tslint:disable-next-line:no-empty-interface
export interface ParkingState extends EntityState<ParkingModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedParkingId: string;
	lastQuery: QueryParkingModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<ParkingModel> = createEntityAdapter<ParkingModel>(
	{ selectId: model => model._id, }
);

export const initialParkingState: ParkingState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryParkingModel({}),
	lastCreatedParkingId: undefined,
	showInitWaitingMessage: true
});

export function parkingReducer(state = initialParkingState, action: ParkingActions): ParkingState {
	switch  (action.type) {
		case ParkingActionTypes.ParkingPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedParkingId: undefined
		};
		case ParkingActionTypes.ParkingActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case ParkingActionTypes.ParkingOnServerCreated: return {
			...state
		};
		case ParkingActionTypes.ParkingCreated: return adapter.addOne(action.payload.parking, {
			...state, lastCreatedBlockId: action.payload.parking._id
		});
		case ParkingActionTypes.ParkingUpdated: return adapter.updateOne(action.payload.partialParking, state);
		case ParkingActionTypes.ParkingDeleted: return adapter.removeOne(action.payload.id, state);
		case ParkingActionTypes.ParkingPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryParkingModel({})
		};
		case ParkingActionTypes.ParkingPageLoaded: {
			return adapter.addMany(action.payload.parking, {
				...initialParkingState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getParkingState = createFeatureSelector<ParkingState>('parking');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
