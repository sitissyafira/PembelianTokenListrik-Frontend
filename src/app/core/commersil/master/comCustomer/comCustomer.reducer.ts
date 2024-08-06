
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { ComCustomerActions, ComCustomerActionTypes } from './comCustomer.action';
import { ComCustomerModel } from './comCustomer.model';
import { QueryComCustomerModel } from './querycomCustomer.model';

export interface ComCustomerState extends EntityState<ComCustomerModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedComCustomerId: string;
	lastQuery: QueryComCustomerModel;
	showInitWaitingMessage: boolean;
}
export const adapter: EntityAdapter<ComCustomerModel> = createEntityAdapter<ComCustomerModel>(
	{ selectId: model => model._id, }
);
export const initialComCustomerState: ComCustomerState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryComCustomerModel({}),
	lastCreatedComCustomerId: undefined,
	showInitWaitingMessage: true
});
export function comCustomerReducer(state = initialComCustomerState, action: ComCustomerActions): ComCustomerState {
	switch  (action.type) {
		case ComCustomerActionTypes.ComCustomerPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedComCustomerId: undefined
		};
		case ComCustomerActionTypes.ComCustomerActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case ComCustomerActionTypes.ComCustomerOnServerCreated: return {
			...state
		};
		case ComCustomerActionTypes.ComCustomerCreated: return adapter.addOne(action.payload.comCustomer, {
			...state, lastCreatedBlockId: action.payload.comCustomer._id
		});
		case ComCustomerActionTypes.ComCustomerUpdated: return adapter.updateOne(action.payload.partialComCustomer, state);
		case ComCustomerActionTypes.ComCustomerDeleted: return adapter.removeOne(action.payload.id, state);
		case ComCustomerActionTypes.ComCustomerPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryComCustomerModel({})
		};
		case ComCustomerActionTypes.ComCustomerPageLoaded: {
			return adapter.addMany(action.payload.comCustomer, {
				...initialComCustomerState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}
export const getComCustomerState = createFeatureSelector<ComCustomerState>('comCustomer');
export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
