import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
import { VndrCategoryState } from './vndrCategory.reducer';
import { each } from 'lodash';
import { VndrCategoryModel } from './vndrCategory.model';


export const selectVndrCategoryState = createFeatureSelector<VndrCategoryState>('vndrCategory');

export const selectVndrCategoryById = (vndrCategoryId: string) => createSelector(
	selectVndrCategoryState,
	vndrCategoryState =>  vndrCategoryState.entities[vndrCategoryId]
);
export const selectVndrCategoryPageLoading = createSelector(
	selectVndrCategoryState,
	vndrCategoryState => {
		return vndrCategoryState.listLoading;
	}
);
export const selectVndrCategoryActionLoading = createSelector(
	selectVndrCategoryState,
	vndrCategoryState => vndrCategoryState.actionsloading
);
export const selectLastCreatedVndrCategoryId = createSelector(
	selectVndrCategoryState,
	vndrCategoryState => vndrCategoryState.lastCreatedVndrCategoryId
);
export const selectVndrCategoryPageLastQuery = createSelector(
	selectVndrCategoryState,
	vndrCategoryState => vndrCategoryState.lastQuery
);
export const selectVndrCategoryInStore = createSelector(
	selectVndrCategoryState,
	vndrCategoryState => {
		const items: VndrCategoryModel[] = [];
		each(vndrCategoryState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: VndrCategoryModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, vndrCategoryState.totalCount, '');
	}
);
export const selectVndrCategoryShowInitWaitingMessage = createSelector(
	selectVndrCategoryState,
	vndrCategoryState => vndrCategoryState.showInitWaitingMessage
);
export const selectHasVndrCategoryInStore = createSelector(
	selectVndrCategoryState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
