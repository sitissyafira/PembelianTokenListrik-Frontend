
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { RequestStockOutActions, RequestStockOutActionTypes } from './requestStockOut.action';
import { RequestStockOutModel } from './requestStockOut.model';
import { QueryRequestStockOutModel } from './queryrequestStockOut.model';

export interface RequestStockOutState extends EntityState<RequestStockOutModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedRequestStockOutId: string;
	lastQuery: QueryRequestStockOutModel;
	showInitWaitingMessage: boolean;
}
export const adapter: EntityAdapter<RequestStockOutModel> = createEntityAdapter<RequestStockOutModel>(
	{ selectId: model => model._id, }
);
export const initialRequestStockOutState: RequestStockOutState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryRequestStockOutModel({}),
	lastCreatedRequestStockOutId: undefined,
	showInitWaitingMessage: true
});
export function requestStockOutReducer(state = initialRequestStockOutState, action: RequestStockOutActions): RequestStockOutState {
	switch  (action.type) {
		case RequestStockOutActionTypes.RequestStockOutPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedRequestStockOutId: undefined
		};
		case RequestStockOutActionTypes.RequestStockOutActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case RequestStockOutActionTypes.RequestStockOutOnServerCreated: return {
			...state
		};
		case RequestStockOutActionTypes.RequestStockOutCreated: return adapter.addOne(action.payload.requestStockOut, {
			...state, lastCreatedBlockId: action.payload.requestStockOut._id
		});
		case RequestStockOutActionTypes.RequestStockOutUpdated: return adapter.updateOne(action.payload.partialRequestStockOut, state);
		case RequestStockOutActionTypes.RequestStockOutDeleted: return adapter.removeOne(action.payload.id, state);
		case RequestStockOutActionTypes.RequestStockOutPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryRequestStockOutModel({})
		};
		case RequestStockOutActionTypes.RequestStockOutPageLoaded: {
			return adapter.addMany(action.payload.requestStockOut, {
				...initialRequestStockOutState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}
export const getRequestStockOutState = createFeatureSelector<RequestStockOutState>('requestStockOut');
export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
