
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { RequestInvoiceActions, RequestInvoiceActionTypes } from './requestInvoice.action';
import { RequestInvoiceModel } from './requestInvoice.model';
import { QueryRequestInvoiceModel } from './queryrequestInvoice.model';

export interface RequestInvoiceState extends EntityState<RequestInvoiceModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedRequestInvoiceId: string;
	lastQuery: QueryRequestInvoiceModel;
	showInitWaitingMessage: boolean;
}
export const adapter: EntityAdapter<RequestInvoiceModel> = createEntityAdapter<RequestInvoiceModel>(
	{ selectId: model => model._id, }
);
export const initialRequestInvoiceState: RequestInvoiceState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryRequestInvoiceModel({}),
	lastCreatedRequestInvoiceId: undefined,
	showInitWaitingMessage: true
});
export function requestInvoiceReducer(state = initialRequestInvoiceState, action: RequestInvoiceActions): RequestInvoiceState {
	switch  (action.type) {
		case RequestInvoiceActionTypes.RequestInvoicePageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedRequestInvoiceId: undefined
		};
		case RequestInvoiceActionTypes.RequestInvoiceActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case RequestInvoiceActionTypes.RequestInvoiceOnServerCreated: return {
			...state
		};
		case RequestInvoiceActionTypes.RequestInvoiceCreated: return adapter.addOne(action.payload.requestInvoice, {
			...state, lastCreatedBlockId: action.payload.requestInvoice._id
		});
		case RequestInvoiceActionTypes.RequestInvoiceUpdated: return adapter.updateOne(action.payload.partialRequestInvoice, state);
		case RequestInvoiceActionTypes.RequestInvoiceDeleted: return adapter.removeOne(action.payload.id, state);
		case RequestInvoiceActionTypes.RequestInvoicePageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryRequestInvoiceModel({})
		};
		case RequestInvoiceActionTypes.RequestInvoicePageLoaded: {
			return adapter.addMany(action.payload.requestInvoice, {
				...initialRequestInvoiceState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}
export const getRequestInvoiceState = createFeatureSelector<RequestInvoiceState>('requestInvoice');
export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
