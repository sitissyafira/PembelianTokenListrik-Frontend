// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { AmState } from './am.reducer';
import { each } from 'lodash';
import { AmModel } from './am.model';


export const selectAmState = createFeatureSelector<AmState>('am');

export const selectAmById = (amId: string) => createSelector(
	selectAmState,
	amState =>  amState.entities[amId]
);

export const selectAmPageLoading = createSelector(
	selectAmState,
	amState => {
		return amState.listLoading;
	}
);

export const selectAmActionLoading = createSelector(
	selectAmState,
	amState => amState.actionsloading
);

export const selectLastCreatedAmId = createSelector(
	selectAmState,
	amState => amState.lastCreatedAmId
);

export const selectAmPageLastQuery = createSelector(
	selectAmState,
	amState => amState.lastQuery
);

export const selectAmInStore = createSelector(
	selectAmState,
	amState => {
		const items: AmModel[] = [];
		each(amState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: AmModel[] = httpExtension.sortArray(items, amState.lastQuery.sortField, amState.lastQuery.sortOrder);
		return new QueryResultsModel(result, amState.totalCount, '');
	}
);

export const selectAmShowInitWaitingMessage = createSelector(
	selectAmState,
	amState => amState.showInitWaitingMessage
);

export const selectHasAmInStore = createSelector(
	selectAmState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
