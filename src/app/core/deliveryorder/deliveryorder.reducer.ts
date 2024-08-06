// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { DeliveryorderActions, DeliveryorderActionTypes } from './deliveryorder.action';
// CRUD

// Models
import { DeliveryorderModel } from './deliveryorder.model';
import { QueryDeliveryorderModel } from './querydeliveryorder.model';

// tslint:disable-next-line:no-empty-interface
export interface DeliveryorderState extends EntityState<DeliveryorderModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedDeliveryorderId: string;
	lastQuery: QueryDeliveryorderModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<DeliveryorderModel> = createEntityAdapter<DeliveryorderModel>(
	{ selectId: model => model._id, }
);

export const initialDeliveryorderState: DeliveryorderState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery: new QueryDeliveryorderModel({}),
	lastCreatedDeliveryorderId: undefined,
	showInitWaitingMessage: true
});

export function deliveryorderReducer(state = initialDeliveryorderState, action: DeliveryorderActions): DeliveryorderState {
	switch (action.type) {
		case DeliveryorderActionTypes.DeliveryorderPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedDeliveryorderId: undefined
		};
		case DeliveryorderActionTypes.DeliveryorderActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case DeliveryorderActionTypes.DeliveryorderOnServerCreated: return {
			...state
		};
		case DeliveryorderActionTypes.DeliveryorderCreated: return adapter.addOne(action.payload.deliveryorder, {
			...state, lastCreatedBlockId: action.payload.deliveryorder._id
		});
		case DeliveryorderActionTypes.DeliveryorderUpdated: return adapter.updateOne(action.payload.partialDeliveryorder, state);
		case DeliveryorderActionTypes.DeliveryorderDeleted: return adapter.removeOne(action.payload.id, state);
		case DeliveryorderActionTypes.DeliveryorderPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryDeliveryorderModel({})
		};
		case DeliveryorderActionTypes.DeliveryorderPageLoaded: {
			return adapter.addMany(action.payload.deliveryorder, {
				...initialDeliveryorderState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getDeliveryorderState = createFeatureSelector<DeliveryorderState>('deliveryorder');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
