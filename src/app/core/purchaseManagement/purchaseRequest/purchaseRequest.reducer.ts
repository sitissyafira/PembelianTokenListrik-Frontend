
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { PurchaseRequestActions, PurchaseRequestActionTypes } from './purchaseRequest.action';
import { PurchaseRequestModel } from './purchaseRequest.model';
import { QueryPurchaseRequestModel } from './querypurchaseRequest.model';

export interface PurchaseRequestState extends EntityState<PurchaseRequestModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedPurchaseRequestId: string;
	lastQuery: QueryPurchaseRequestModel;
	showInitWaitingMessage: boolean;
}
export const adapter: EntityAdapter<PurchaseRequestModel> = createEntityAdapter<PurchaseRequestModel>(
	{ selectId: model => model._id, }
);
export const initialPurchaseRequestState: PurchaseRequestState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryPurchaseRequestModel({}),
	lastCreatedPurchaseRequestId: undefined,
	showInitWaitingMessage: true
});
export function purchaseRequestReducer(state = initialPurchaseRequestState, action: PurchaseRequestActions): PurchaseRequestState {
	switch  (action.type) {
		case PurchaseRequestActionTypes.PurchaseRequestPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedPurchaseRequestId: undefined
		};
		case PurchaseRequestActionTypes.PurchaseRequestActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case PurchaseRequestActionTypes.PurchaseRequestOnServerCreated: return {
			...state
		};
		case PurchaseRequestActionTypes.PurchaseRequestCreated: return adapter.addOne(action.payload.purchaseRequest, {
			...state, lastCreatedBlockId: action.payload.purchaseRequest._id
		});
		case PurchaseRequestActionTypes.PurchaseRequestUpdated: return adapter.updateOne(action.payload.partialPurchaseRequest, state);
		case PurchaseRequestActionTypes.PurchaseRequestDeleted: return adapter.removeOne(action.payload.id, state);
		case PurchaseRequestActionTypes.PurchaseRequestPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryPurchaseRequestModel({})
		};
		case PurchaseRequestActionTypes.PurchaseRequestPageLoaded: {
			return adapter.addMany(action.payload.purchaseRequest, {
				...initialPurchaseRequestState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}
export const getPurchaseRequestState = createFeatureSelector<PurchaseRequestState>('purchaseRequest');
export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
