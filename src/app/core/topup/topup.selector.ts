import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
import { TopUpState } from './topup.reducer';
import { each } from 'lodash';
import { TopUpModel } from './topup.model';

export const selectTopUpState = createFeatureSelector<TopUpState>('topup');
export const selectTopUpById = (topupId: string) => createSelector(
	selectTopUpState,
	topupState => topupState.entities[topupId]
);
export const selectTopUpPageLoading = createSelector(
	selectTopUpState,
	topupState => {
		return topupState.listLoading;
	}
);
export const selectTopUpActionLoading = createSelector(
	selectTopUpState,
	topupState => topupState.actionsloading
);
export const selectLastCreatedTopUpId = createSelector(
	selectTopUpState,
	topupState => topupState.lastCreatedTopUpId
);
export const selectTopUpPageLastQuery = createSelector(
	selectTopUpState,
	topupState => topupState.lastQuery
);
export const selectTopUpInStore = createSelector(
	selectTopUpState,
	topupState => {
		const items: TopUpModel[] = [];
		each(topupState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: TopUpModel[] = httpExtension.sortArray(items, topupState.lastQuery.sortField, topupState.lastQuery.sortOrder);
		return new QueryResultsModel(result, topupState.totalCount, '');
	}
);
export const selectTopUpShowInitWaitingMessage = createSelector(
	selectTopUpState,
	topupState => topupState.showInitWaitingMessage
);
export const selectHasTopUpInStore = createSelector(
	selectTopUpState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
