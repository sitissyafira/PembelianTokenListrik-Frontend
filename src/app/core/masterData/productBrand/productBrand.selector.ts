import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
import { ProductBrandState } from './productBrand.reducer';
import { each } from 'lodash';
import { ProductBrandModel } from './productBrand.model';


export const selectProductBrandState = createFeatureSelector<ProductBrandState>('productBrand');

export const selectProductBrandById = (productBrandId: string) => createSelector(
	selectProductBrandState,
	productBrandState =>  productBrandState.entities[productBrandId]
);
export const selectProductBrandPageLoading = createSelector(
	selectProductBrandState,
	productBrandState => {
		return productBrandState.listLoading;
	}
);
export const selectProductBrandActionLoading = createSelector(
	selectProductBrandState,
	productBrandState => productBrandState.actionsloading
);
export const selectLastCreatedProductBrandId = createSelector(
	selectProductBrandState,
	productBrandState => productBrandState.lastCreatedProductBrandId
);
export const selectProductBrandPageLastQuery = createSelector(
	selectProductBrandState,
	productBrandState => productBrandState.lastQuery
);
export const selectProductBrandInStore = createSelector(
	selectProductBrandState,
	productBrandState => {
		const items: ProductBrandModel[] = [];
		each(productBrandState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: ProductBrandModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, productBrandState.totalCount, '');
	}
);
export const selectProductBrandShowInitWaitingMessage = createSelector(
	selectProductBrandState,
	productBrandState => productBrandState.showInitWaitingMessage
);
export const selectHasProductBrandInStore = createSelector(
	selectProductBrandState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
