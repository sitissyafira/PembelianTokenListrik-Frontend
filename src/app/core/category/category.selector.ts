// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { CategoryState } from './category.reducer';
import { each } from 'lodash';
import { CategoryModel } from './category.model';


export const selectCategoryState = createFeatureSelector<CategoryState>('category');

export const selectCategoryById = (categoryId: string) => createSelector(
	selectCategoryState,
	categoryState =>  categoryState.entities[categoryId]
);

export const selectCategoryPageLoading = createSelector(
	selectCategoryState,
	categoryState => {
		return categoryState.listLoading;
	}
);

export const selectCategoryActionLoading = createSelector(
	selectCategoryState,
	categoryState => categoryState.actionsloading
);

export const selectLastCreatedCategoryId = createSelector(
	selectCategoryState,
	categoryState => categoryState.lastCreatedCategoryId
);

export const selectCategoryPageLastQuery = createSelector(
	selectCategoryState,
	categoryState => categoryState.lastQuery
);

export const selectCategoryInStore = createSelector(
	selectCategoryState,
	categoryState => {
		const items: CategoryModel[] = [];
		each(categoryState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: CategoryModel[] = httpExtension.sortArray(items, categoryState.lastQuery.sortField, categoryState.lastQuery.sortOrder);
		return new QueryResultsModel(result, categoryState.totalCount, '');
	}
);

export const selectCategoryShowInitWaitingMessage = createSelector(
	selectCategoryState,
	categoryState => categoryState.showInitWaitingMessage
);

export const selectHasCategoryInStore = createSelector(
	selectCategoryState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
