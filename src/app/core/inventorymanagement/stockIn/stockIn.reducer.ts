
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { StockInActions, StockInActionTypes } from './stockIn.action';
import { StockInModel } from './stockIn.model';
import { QueryStockInModel } from './querystockIn.model';

export interface StockInState extends EntityState<StockInModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedStockInId: string;
	lastQuery: QueryStockInModel;
	showInitWaitingMessage: boolean;
}
export const adapter: EntityAdapter<StockInModel> = createEntityAdapter<StockInModel>(
	{ selectId: model => model._id, }
);
export const initialStockInState: StockInState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryStockInModel({}),
	lastCreatedStockInId: undefined,
	showInitWaitingMessage: true
});
export function stockInReducer(state = initialStockInState, action: StockInActions): StockInState {
	switch  (action.type) {
		case StockInActionTypes.StockInPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedStockInId: undefined
		};
		case StockInActionTypes.StockInActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case StockInActionTypes.StockInOnServerCreated: return {
			...state
		};
		case StockInActionTypes.StockInCreated: return adapter.addOne(action.payload.stockIn, {
			...state, lastCreatedBlockId: action.payload.stockIn._id
		});
		case StockInActionTypes.StockInUpdated: return adapter.updateOne(action.payload.partialStockIn, state);
		case StockInActionTypes.StockInDeleted: return adapter.removeOne(action.payload.id, state);
		case StockInActionTypes.StockInPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryStockInModel({})
		};
		case StockInActionTypes.StockInPageLoaded: {
			return adapter.addMany(action.payload.stockIn, {
				...initialStockInState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}
export const getStockInState = createFeatureSelector<StockInState>('stockIn');
export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
