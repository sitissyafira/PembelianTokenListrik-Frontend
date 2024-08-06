
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { EmergencyActions, EmergencyActionTypes } from './emergency.action';

import { EmergencyModel } from './emergency.model';
import { QueryEmergencyModel } from './queryemergency.model';

export interface EmergencyState extends EntityState<EmergencyModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedEmergencyId: string;
	lastQuery: QueryEmergencyModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<EmergencyModel> = createEntityAdapter<EmergencyModel>(
	{ selectId: model => model._id, }
);

export const initialEmergencyState: EmergencyState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryEmergencyModel({}),
	lastCreatedEmergencyId: undefined,
	showInitWaitingMessage: true
});

export function emergencyReducer(state = initialEmergencyState, action: EmergencyActions): EmergencyState {
	switch  (action.type) {
		case EmergencyActionTypes.EmergencyPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedEmergencyId: undefined
		};
		case EmergencyActionTypes.EmergencyActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case EmergencyActionTypes.EmergencyOnServerCreated: return {
			...state
		};
		case EmergencyActionTypes.EmergencyCreated: return adapter.addOne(action.payload.emergency, {
			...state, lastCreatedBlockId: action.payload.emergency._id
		});
		case EmergencyActionTypes.EmergencyUpdated: return adapter.updateOne(action.payload.partialEmergency, state);
		case EmergencyActionTypes.EmergencyDeleted: return adapter.removeOne(action.payload.id, state);
		case EmergencyActionTypes.EmergencyPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryEmergencyModel({})
		};
		case EmergencyActionTypes.EmergencyPageLoaded: {
			return adapter.addMany(action.payload.emergency, {
				...initialEmergencyState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getEmergencyState = createFeatureSelector<EmergencyState>('emergency');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
