// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { PublicDeliveryorderActions, PublicDeliveryorderActionTypes } from './publicdeliveryorder.action';
// CRUD

// Models
import { PublicDeliveryorderModel } from './publicdeliveryorder.model';
import { QueryPublicDeliveryorderModel } from './querypublicdeliveryorder.model';

// tslint:disable-next-line:no-empty-interface
export interface PublicDeliveryorderState extends EntityState<PublicDeliveryorderModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedPublicDeliveryorderId: string;
	lastQuery: QueryPublicDeliveryorderModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<PublicDeliveryorderModel> = createEntityAdapter<PublicDeliveryorderModel>(
	{ selectId: model => model._id, }
);

export const initialPublicDeliveryorderState: PublicDeliveryorderState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery: new QueryPublicDeliveryorderModel({}),
	lastCreatedPublicDeliveryorderId: undefined,
	showInitWaitingMessage: true
});

export function publicDeliveryorderReducer(state = initialPublicDeliveryorderState, action: PublicDeliveryorderActions): PublicDeliveryorderState {
	switch (action.type) {
		case PublicDeliveryorderActionTypes.PublicDeliveryorderPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedPublicDeliveryorderId: undefined
		};
		case PublicDeliveryorderActionTypes.PublicDeliveryorderActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case PublicDeliveryorderActionTypes.PublicDeliveryorderOnServerCreated: return {
			...state
		};
		case PublicDeliveryorderActionTypes.PublicDeliveryorderCreated: return adapter.addOne(action.payload.publicDeliveryorder, {
			...state, lastCreatedBlockId: action.payload.publicDeliveryorder._id
		});
		case PublicDeliveryorderActionTypes.PublicDeliveryorderUpdated: return adapter.updateOne(action.payload.partialPublicDeliveryorder, state);
		case PublicDeliveryorderActionTypes.PublicDeliveryorderDeleted: return adapter.removeOne(action.payload.id, state);
		case PublicDeliveryorderActionTypes.PublicDeliveryorderPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryPublicDeliveryorderModel({})
		};
		case PublicDeliveryorderActionTypes.PublicDeliveryorderPageLoaded: {
			return adapter.addMany(action.payload.publicDeliveryorder, {
				...initialPublicDeliveryorderState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getPublicDeliveryorderState = createFeatureSelector<PublicDeliveryorderState>('publicDeliveryorder');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
