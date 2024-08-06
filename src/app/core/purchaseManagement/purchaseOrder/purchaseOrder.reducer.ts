
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { PurchaseOrderActions, PurchaseOrderActionTypes } from './purchaseOrder.action';
import { PurchaseOrderModel } from './purchaseOrder.model';
import { QueryPurchaseOrderModel } from './querypurchaseOrder.model';

export interface PurchaseOrderState extends EntityState<PurchaseOrderModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedPurchaseOrderId: string;
	lastQuery: QueryPurchaseOrderModel;
	showInitWaitingMessage: boolean;
}
export const adapter: EntityAdapter<PurchaseOrderModel> = createEntityAdapter<PurchaseOrderModel>(
	{ selectId: model => model._id, }
);
export const initialPurchaseOrderState: PurchaseOrderState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryPurchaseOrderModel({}),
	lastCreatedPurchaseOrderId: undefined,
	showInitWaitingMessage: true
});
export function purchaseOrderReducer(state = initialPurchaseOrderState, action: PurchaseOrderActions): PurchaseOrderState {
	switch  (action.type) {
		case PurchaseOrderActionTypes.PurchaseOrderPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedPurchaseOrderId: undefined
		};
		case PurchaseOrderActionTypes.PurchaseOrderActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case PurchaseOrderActionTypes.PurchaseOrderOnServerCreated: return {
			...state
		};
		case PurchaseOrderActionTypes.PurchaseOrderCreated: return adapter.addOne(action.payload.purchaseOrder, {
			...state, lastCreatedBlockId: action.payload.purchaseOrder._id
		});
		case PurchaseOrderActionTypes.PurchaseOrderUpdated: return adapter.updateOne(action.payload.partialPurchaseOrder, state);
		case PurchaseOrderActionTypes.PurchaseOrderDeleted: return adapter.removeOne(action.payload.id, state);
		case PurchaseOrderActionTypes.PurchaseOrderPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryPurchaseOrderModel({})
		};
		case PurchaseOrderActionTypes.PurchaseOrderPageLoaded: {
			return adapter.addMany(action.payload.purchaseOrder, {
				...initialPurchaseOrderState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}
export const getPurchaseOrderState = createFeatureSelector<PurchaseOrderState>('purchaseOrder');
export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
