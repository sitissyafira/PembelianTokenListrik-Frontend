
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { ProductCategoryActions, ProductCategoryActionTypes } from './productCategory.action';
import { ProductCategoryModel } from './productCategory.model';
import { QueryProductCategoryModel } from './queryproductCategory.model';

export interface ProductCategoryState extends EntityState<ProductCategoryModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedProductCategoryId: string;
	lastQuery: QueryProductCategoryModel;
	showInitWaitingMessage: boolean;
}
export const adapter: EntityAdapter<ProductCategoryModel> = createEntityAdapter<ProductCategoryModel>(
	{ selectId: model => model._id, }
);
export const initialProductCategoryState: ProductCategoryState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryProductCategoryModel({}),
	lastCreatedProductCategoryId: undefined,
	showInitWaitingMessage: true
});
export function productCategoryReducer(state = initialProductCategoryState, action: ProductCategoryActions): ProductCategoryState {
	switch  (action.type) {
		case ProductCategoryActionTypes.ProductCategoryPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedProductCategoryId: undefined
		};
		case ProductCategoryActionTypes.ProductCategoryActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case ProductCategoryActionTypes.ProductCategoryOnServerCreated: return {
			...state
		};
		case ProductCategoryActionTypes.ProductCategoryCreated: return adapter.addOne(action.payload.productCategory, {
			...state, lastCreatedBlockId: action.payload.productCategory._id
		});
		case ProductCategoryActionTypes.ProductCategoryUpdated: return adapter.updateOne(action.payload.partialProductCategory, state);
		case ProductCategoryActionTypes.ProductCategoryDeleted: return adapter.removeOne(action.payload.id, state);
		case ProductCategoryActionTypes.ProductCategoryPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryProductCategoryModel({})
		};
		case ProductCategoryActionTypes.ProductCategoryPageLoaded: {
			return adapter.addMany(action.payload.productCategory, {
				...initialProductCategoryState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}
export const getProductCategoryState = createFeatureSelector<ProductCategoryState>('productCategory');
export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
