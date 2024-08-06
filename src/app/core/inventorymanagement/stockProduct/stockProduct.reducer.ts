
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { StockProductActions, StockProductActionTypes } from './stockProduct.action';
import { StockProductModel } from './stockProduct.model';
import { QueryStockProductModel } from './querystockProduct.model';

export interface StockProductState extends EntityState<StockProductModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedStockProductId: string;
	lastQuery: QueryStockProductModel;
	showInitWaitingMessage: boolean;
}
export const adapter: EntityAdapter<StockProductModel> = createEntityAdapter<StockProductModel>(
	{ selectId: model => model._id, }
);
export const initialStockProductState: StockProductState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryStockProductModel({}),
	lastCreatedStockProductId: undefined,
	showInitWaitingMessage: true
});
export function stockProductReducer(state = initialStockProductState, action: StockProductActions): StockProductState {
	switch  (action.type) {
		case StockProductActionTypes.StockProductPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedStockProductId: undefined
		};
		case StockProductActionTypes.StockProductActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case StockProductActionTypes.StockProductOnServerCreated: return {
			...state
		};
		case StockProductActionTypes.StockProductCreated: return adapter.addOne(action.payload.stockProduct, {
			...state, lastCreatedBlockId: action.payload.stockProduct._id
		});
		case StockProductActionTypes.StockProductUpdated: return adapter.updateOne(action.payload.partialStockProduct, state);
		case StockProductActionTypes.StockProductDeleted: return adapter.removeOne(action.payload.id, state);
		case StockProductActionTypes.StockProductPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryStockProductModel({})
		};
		case StockProductActionTypes.StockProductPageLoaded: {
			return adapter.addMany(action.payload.stockProduct, {
				...initialStockProductState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}
export const getStockProductState = createFeatureSelector<StockProductState>('stockProduct');
export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
