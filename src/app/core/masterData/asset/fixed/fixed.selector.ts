// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../../_base/crud';
// State
import { FixedState } from './fixed.reducer';
import { each } from 'lodash';
import { FixedModel } from './fixed.model';


export const selectFixedState = createFeatureSelector<FixedState>('fixed');

export const selectFixedById = (fixedId: string) => createSelector(
	selectFixedState,
	fixedState =>  fixedState.entities[fixedId]
);

export const selectFixedPageLoading = createSelector(
	selectFixedState,
	fixedState => {
		return fixedState.listLoading;
	}
);

export const selectFixedActionLoading = createSelector(
	selectFixedState,
	fixedState => fixedState.actionsloading
);

export const selectLastCreatedFixedId = createSelector(
	selectFixedState,
	fixedState => fixedState.lastCreatedFixedId
);

export const selectFixedPageLastQuery = createSelector(
	selectFixedState,
	fixedState => fixedState.lastQuery
);

export const selectFixedInStore = createSelector(
	selectFixedState,
	fixedState => {
		const items: FixedModel[] = [];
		each(fixedState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: FixedModel[] = httpExtension.sortArray(items, fixedState.lastQuery.sortField, fixedState.lastQuery.sortOrder);
		return new QueryResultsModel(result, fixedState.totalCount, '');
	}
);

export const selectFixedShowInitWaitingMessage = createSelector(
	selectFixedState,
	fixedState => fixedState.showInitWaitingMessage
);

export const selectHasFixedInStore = createSelector(
	selectFixedState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
