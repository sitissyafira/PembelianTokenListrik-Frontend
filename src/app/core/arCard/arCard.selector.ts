// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { ArCardState } from './arCard.reducer';
import { each } from 'lodash';
import { ArCardModel } from './arCard.model';


export const selectArCardState = createFeatureSelector<ArCardState>('arCard');

export const selectArCardById = (arCardId: string) => createSelector(
	selectArCardState,
	arCardState => arCardState.entities[arCardId]
);

export const selectArCardPageLoading = createSelector(
	selectArCardState,
	arCardState => {
		return arCardState.listLoading;
	}
);

export const selectArCardActionLoading = createSelector(
	selectArCardState,
	arCardState => arCardState.actionsloading
);

export const selectLastCreatedArCardId = createSelector(
	selectArCardState,
	arCardState => arCardState.lastCreatedArCardId
);

export const selectArCardPageLastQuery = createSelector(
	selectArCardState,
	arCardState => arCardState.lastQuery
);

export const selectArCardInStore = createSelector(
	selectArCardState,
	arCardState => {
		const items: ArCardModel[] = [];
		each(arCardState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: ArCardModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, arCardState.totalCount, '');
	}
);

export const selectArCardShowInitWaitingMessage = createSelector(
	selectArCardState,
	arCardState => arCardState.showInitWaitingMessage
);

export const selectHasArCardGroupInStore = createSelector(
	selectArCardState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
