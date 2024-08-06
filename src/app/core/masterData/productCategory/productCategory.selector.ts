import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
import { ProductCategoryState } from './productCategory.reducer';
import { each } from 'lodash';
import { ProductCategoryModel } from './productCategory.model';


export const selectProductCategoryState = createFeatureSelector<ProductCategoryState>('productCategory');

export const selectProductCategoryById = (productCategoryId: string) => createSelector(
	selectProductCategoryState,
	productCategoryState =>  productCategoryState.entities[productCategoryId]
);
export const selectProductCategoryPageLoading = createSelector(
	selectProductCategoryState,
	productCategoryState => {
		return productCategoryState.listLoading;
	}
);
export const selectProductCategoryActionLoading = createSelector(
	selectProductCategoryState,
	productCategoryState => productCategoryState.actionsloading
);
export const selectLastCreatedProductCategoryId = createSelector(
	selectProductCategoryState,
	productCategoryState => productCategoryState.lastCreatedProductCategoryId
);
export const selectProductCategoryPageLastQuery = createSelector(
	selectProductCategoryState,
	productCategoryState => productCategoryState.lastQuery
);
export const selectProductCategoryInStore = createSelector(
	selectProductCategoryState,
	productCategoryState => {
		const items: ProductCategoryModel[] = [];
		each(productCategoryState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: ProductCategoryModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, productCategoryState.totalCount, '');
	}
);
export const selectProductCategoryShowInitWaitingMessage = createSelector(
	selectProductCategoryState,
	productCategoryState => productCategoryState.showInitWaitingMessage
);
export const selectHasProductCategoryInStore = createSelector(
	selectProductCategoryState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
