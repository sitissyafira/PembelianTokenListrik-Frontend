
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { ProductBrandActions, ProductBrandActionTypes } from './productBrand.action';
import { ProductBrandModel } from './productBrand.model';
import { QueryProductBrandModel } from './queryproductBrand.model';

export interface ProductBrandState extends EntityState<ProductBrandModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedProductBrandId: string;
	lastQuery: QueryProductBrandModel;
	showInitWaitingMessage: boolean;
}
export const adapter: EntityAdapter<ProductBrandModel> = createEntityAdapter<ProductBrandModel>(
	{ selectId: model => model._id, }
);
export const initialProductBrandState: ProductBrandState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryProductBrandModel({}),
	lastCreatedProductBrandId: undefined,
	showInitWaitingMessage: true
});
export function productBrandReducer(state = initialProductBrandState, action: ProductBrandActions): ProductBrandState {
	switch  (action.type) {
		case ProductBrandActionTypes.ProductBrandPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedProductBrandId: undefined
		};
		case ProductBrandActionTypes.ProductBrandActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case ProductBrandActionTypes.ProductBrandOnServerCreated: return {
			...state
		};
		case ProductBrandActionTypes.ProductBrandCreated: return adapter.addOne(action.payload.productBrand, {
			...state, lastCreatedBlockId: action.payload.productBrand._id
		});
		case ProductBrandActionTypes.ProductBrandUpdated: return adapter.updateOne(action.payload.partialProductBrand, state);
		case ProductBrandActionTypes.ProductBrandDeleted: return adapter.removeOne(action.payload.id, state);
		case ProductBrandActionTypes.ProductBrandPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryProductBrandModel({})
		};
		case ProductBrandActionTypes.ProductBrandPageLoaded: {
			return adapter.addMany(action.payload.productBrand, {
				...initialProductBrandState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}
export const getProductBrandState = createFeatureSelector<ProductBrandState>('productBrand');
export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
