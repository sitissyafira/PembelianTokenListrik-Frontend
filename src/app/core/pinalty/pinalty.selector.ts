// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { PinaltyState } from './pinalty.reducer';
import { each } from 'lodash';
import { PinaltyModel } from './pinalty.model';


export const selectPinaltyState = createFeatureSelector<PinaltyState>('pinalty');

export const selectPinaltyById = (pinaltyId: string) => createSelector(
	selectPinaltyState,
	pinaltyState =>  pinaltyState.entities[pinaltyId]
);

export const selectPinaltyPageLoading = createSelector(
	selectPinaltyState,
	pinaltyState => {
		return pinaltyState.listLoading;
	}
);

export const selectPinaltyActionLoading = createSelector(
	selectPinaltyState,
	pinaltyState => pinaltyState.actionsloading
);

export const selectLastCreatedPinaltyId = createSelector(
	selectPinaltyState,
	pinaltyState => pinaltyState.lastCreatedPinaltyId
);

export const selectPinaltyPageLastQuery = createSelector(
	selectPinaltyState,
	pinaltyState => pinaltyState.lastQuery
);

export const selectPinaltyInStore = createSelector(
	selectPinaltyState,
	pinaltyState => {
		const items: PinaltyModel[] = [];
		each(pinaltyState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: PinaltyModel[] = httpExtension.sortArray(items, pinaltyState.lastQuery.sortField, pinaltyState.lastQuery.sortOrder);
		return new QueryResultsModel(result, pinaltyState.totalCount, '');
	}
);

export const selectPinaltyShowInitWaitingMessage = createSelector(
	selectPinaltyState,
	pinaltyState => pinaltyState.showInitWaitingMessage
);

export const selectHasPinaltyInStore = createSelector(
	selectPinaltyState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
