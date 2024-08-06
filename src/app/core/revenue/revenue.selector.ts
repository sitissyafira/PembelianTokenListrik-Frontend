// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { RevenueState } from './revenue.reducer';
import { each } from 'lodash';
import { RevenueModel } from './revenue.model';


export const selectRevenueState = createFeatureSelector<RevenueState>('revenue');

export const selectRevenueById = (revenueId: string) => createSelector(
	selectRevenueState,
	revenueState =>  revenueState.entities[revenueId]
);

export const selectRevenuePageLoading = createSelector(
	selectRevenueState,
	revenueState => {
		return revenueState.listLoading;
	}
);

export const selectRevenueActionLoading = createSelector(
	selectRevenueState,
	revenueState => revenueState.actionsloading
);

export const selectLastCreatedRevenueId = createSelector(
	selectRevenueState,
	revenueState => revenueState.lastCreatedRevenueId
);

export const selectRevenuePageLastQuery = createSelector(
	selectRevenueState,
	revenueState => revenueState.lastQuery
);

export const selectRevenueInStore = createSelector(
	selectRevenueState,
	revenueState => {
		const items: RevenueModel[] = [];
		each(revenueState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: RevenueModel[] = httpExtension.sortArray(items, revenueState.lastQuery.sortField, revenueState.lastQuery.sortOrder);
		return new QueryResultsModel(result, revenueState.totalCount, '');
	}
);

export const selectRevenueShowInitWaitingMessage = createSelector(
	selectRevenueState,
	revenueState => revenueState.showInitWaitingMessage
);

export const selectHasRevenueInStore = createSelector(
	selectRevenueState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
