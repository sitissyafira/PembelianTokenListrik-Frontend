
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { RenterActions, RenterActionTypes } from './renter.action';

import { RenterModel } from './renter.model';
import { QueryRenterModel } from './queryrenter.model';

export interface RenterState extends EntityState<RenterModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedRenterId: string;
	lastQuery: QueryRenterModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<RenterModel> = createEntityAdapter<RenterModel>(
	{ selectId: model => model._id, }
);

export const initialRenterState: RenterState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery: new QueryRenterModel({}),
	lastCreatedRenterId: undefined,
	showInitWaitingMessage: true
});

export function renterReducer(state = initialRenterState, action: RenterActions): RenterState {
	switch (action.type) {
		case RenterActionTypes.RenterPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedRenterId: undefined
		};
		case RenterActionTypes.RenterActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case RenterActionTypes.RenterOnServerCreated: return {
			...state
		};
		case RenterActionTypes.RenterCreated: return adapter.addOne(action.payload.renter, {
			...state, lastCreatedBlockId: action.payload.renter._id
		});
		case RenterActionTypes.RenterUpdated: return adapter.updateOne(action.payload.partialRenter, state);
		case RenterActionTypes.RenterDeleted: return adapter.removeOne(action.payload.id, state);
		case RenterActionTypes.RenterPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryRenterModel({})
		};
		case RenterActionTypes.RenterPageLoaded: {
			return adapter.addMany(action.payload.renter, {
				...initialRenterState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getRenterState = createFeatureSelector<RenterState>('renter');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
