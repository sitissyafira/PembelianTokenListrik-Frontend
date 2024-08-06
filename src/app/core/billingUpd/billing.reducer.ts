import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { BillingActions, BillingActionTypes } from './billing.action';
// CRUD
import { QueryBillingModel } from './querybilling.model';
// Models
import { BillingModel } from './billing.model';

export interface BillingState extends EntityState<BillingModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedBillingId: string;
	lastQuery: QueryBillingModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<BillingModel> = createEntityAdapter<BillingModel>(
	{ selectId: model => model._id, }
);

export const initialBillingState: BillingState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryBillingModel({}),
	lastCreatedBillingId: undefined,
	showInitWaitingMessage: true
});

export function billingReducer(state = initialBillingState, action: BillingActions): BillingState {
	switch  (action.type) {
		case BillingActionTypes.BillingPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedBillingId: undefined
		};
		case BillingActionTypes.BillingActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case BillingActionTypes.BillingOnServerCreated: return {
			...state
		};
		case BillingActionTypes.BillingCreated: return adapter.addOne(action.payload.billing, {
			...state, lastCreatedBlockId: action.payload.billing._id
		});
		case BillingActionTypes.BillingUpdated: return adapter.updateOne(action.payload.partialBilling, state);
		case BillingActionTypes.BillingDeleted: return adapter.removeOne(action.payload.id, state);
		case BillingActionTypes.BillingPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryBillingModel({})
		};
		case BillingActionTypes.BillingPageLoaded: {
			return adapter.addMany(action.payload.billing, {
				...initialBillingState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getBillingState = createFeatureSelector<BillingState>('billing');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
