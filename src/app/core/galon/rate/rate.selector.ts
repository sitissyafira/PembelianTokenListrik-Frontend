// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { GalonRateState } from './rate.reducer';
import { each } from 'lodash';
import { GalonRateModel } from './rate.model';


export const selectGalonRateState = createFeatureSelector<GalonRateState>('galonRate');

export const selectGalonRateById = (galonRateId: string) => createSelector(
	selectGalonRateState,
	galonRateState => galonRateState.entities[galonRateId]
);

export const selectGalonRatePageLoading = createSelector(
	selectGalonRateState,
	galonRateState => {
		return galonRateState.listLoading;
	}
);

export const selectGalonRateActionLoading = createSelector(
	selectGalonRateState,
	galonRateState => galonRateState.actionsloading
);

export const selectLastCreatedGalonRateId = createSelector(
	selectGalonRateState,
	galonRateState => galonRateState.lastCreatedGalonRateId
);

export const selectGalonRatePageLastQuery = createSelector(
	selectGalonRateState,
	galonRateState => galonRateState.lastQuery
);

export const selectGalonRateInStore = createSelector(
	selectGalonRateState,
	galonRateState => {
		const items: GalonRateModel[] = [];
		each(galonRateState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: GalonRateModel[] = httpExtension.sortArray(items, galonRateState.lastQuery.sortField, galonRateState.lastQuery.sortOrder);
		return new QueryResultsModel(result, galonRateState.totalCount, '');
	}
);

export const selectGalonRateShowInitWaitingMessage = createSelector(
	selectGalonRateState,
	galonRateState => galonRateState.showInitWaitingMessage
);

export const selectHasGalonRateInStore = createSelector(
	selectGalonRateState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
