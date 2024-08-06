import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
import { TrGalonState } from './trGalon.reducer';
import { each } from 'lodash';
import { TrGalonModel } from './trGalon.model';

export const selectTrGalonState = createFeatureSelector<TrGalonState>('trGalon');
export const selectTrGalonById = (trGalonId: string) => createSelector(
	selectTrGalonState,
	trGalonState => trGalonState.entities[trGalonId]
);
export const selectTrGalonPageLoading = createSelector(
	selectTrGalonState,
	trGalonState => {
		return trGalonState.listLoading;
	}
);
export const selectTrGalonActionLoading = createSelector(
	selectTrGalonState,
	trGalonState => trGalonState.actionsloading
);
export const selectLastCreatedTrGalonId = createSelector(
	selectTrGalonState,
	trGalonState => trGalonState.lastCreatedTrGalonId
);
export const selectTrGalonPageLastQuery = createSelector(
	selectTrGalonState,
	trGalonState => trGalonState.lastQuery
);
export const selectTrGalonInStore = createSelector(
	selectTrGalonState,
	trGalonState => {
		const items: TrGalonModel[] = [];
		each(trGalonState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: TrGalonModel[] = httpExtension.sortArray(items, trGalonState.lastQuery.sortField, trGalonState.lastQuery.sortOrder);
		return new QueryResultsModel(result, trGalonState.totalCount, '');
	}
);
export const selectTrGalonShowInitWaitingMessage = createSelector(
	selectTrGalonState,
	trGalonState => trGalonState.showInitWaitingMessage
);
export const selectHasTrGalonInStore = createSelector(
	selectTrGalonState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
