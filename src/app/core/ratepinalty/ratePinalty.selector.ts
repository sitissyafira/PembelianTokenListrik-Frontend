// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { RatePinaltyState } from './ratePinalty.reducer';
import { each } from 'lodash';
import { RatePinaltyModel } from './ratePinalty.model';


export const selectRatePinaltyState = createFeatureSelector<RatePinaltyState>('ratePinalty');

export const selectRatePinaltyById = (ratePinaltyId: string) => createSelector(
	selectRatePinaltyState,
	ratePinaltyState =>  ratePinaltyState.entities[ratePinaltyId]
);

export const selectRatePinaltyPageLoading = createSelector(
	selectRatePinaltyState,
	ratePinaltyState => {
		return ratePinaltyState.listLoading;
	}
);

export const selectRatePinaltyActionLoading = createSelector(
	selectRatePinaltyState,
	ratePinaltyState => ratePinaltyState.actionsloading
);

export const selectLastCreatedRatePinaltyId = createSelector(
	selectRatePinaltyState,
	ratePinaltyState => ratePinaltyState.lastCreatedRatePinaltyId
);

export const selectRatePinaltyPageLastQuery = createSelector(
	selectRatePinaltyState,
	ratePinaltyState => ratePinaltyState.lastQuery
);

export const selectRatePinaltyInStore = createSelector(
	selectRatePinaltyState,
	ratePinaltyState => {
		const items: RatePinaltyModel[] = [];
		each(ratePinaltyState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: RatePinaltyModel[] = httpExtension.sortArray(items, ratePinaltyState.lastQuery.sortField, ratePinaltyState.lastQuery.sortOrder);
		return new QueryResultsModel(result, ratePinaltyState.totalCount, '');
	}
);

export const selectRatePinaltyShowInitWaitingMessage = createSelector(
	selectRatePinaltyState,
	ratePinaltyState => ratePinaltyState.showInitWaitingMessage
);

export const selectHasRatePinaltyInStore = createSelector(
	selectRatePinaltyState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
