
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { StockOutActions, StockOutActionTypes } from './stockOut.action';
import { StockOutModel } from './stockOut.model';
import { QueryStockOutModel } from './querystockOut.model';

export interface StockOutState extends EntityState<StockOutModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedStockOutId: string;
	lastQuery: QueryStockOutModel;
	showInitWaitingMessage: boolean;
}
export const adapter: EntityAdapter<StockOutModel> = createEntityAdapter<StockOutModel>(
	{ selectId: model => model._id, }
);
export const initialStockOutState: StockOutState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryStockOutModel({}),
	lastCreatedStockOutId: undefined,
	showInitWaitingMessage: true
});
export function stockOutReducer(state = initialStockOutState, action: StockOutActions): StockOutState {
	switch  (action.type) {
		case StockOutActionTypes.StockOutPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedStockOutId: undefined
		};
		case StockOutActionTypes.StockOutActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case StockOutActionTypes.StockOutOnServerCreated: return {
			...state
		};
		case StockOutActionTypes.StockOutCreated: return adapter.addOne(action.payload.stockOut, {
			...state, lastCreatedBlockId: action.payload.stockOut._id
		});
		case StockOutActionTypes.StockOutUpdated: return adapter.updateOne(action.payload.partialStockOut, state);
		case StockOutActionTypes.StockOutDeleted: return adapter.removeOne(action.payload.id, state);
		case StockOutActionTypes.StockOutPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryStockOutModel({})
		};
		case StockOutActionTypes.StockOutPageLoaded: {
			return adapter.addMany(action.payload.stockOut, {
				...initialStockOutState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}
export const getStockOutState = createFeatureSelector<StockOutState>('stockOut');
export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
