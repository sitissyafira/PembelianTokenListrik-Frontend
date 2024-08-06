import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
import { TabulationState } from './tabulation.reducer';
import { each } from 'lodash';
import { TabulationModel } from './tabulation.model';


export const selectTabulationState = createFeatureSelector<TabulationState>('tabulation');

export const selectTabulationById = (tabulationId: string) => createSelector(
	selectTabulationState,
	tabulationState =>  tabulationState.entities[tabulationId]
);
export const selectTabulationPageLoading = createSelector(
	selectTabulationState,
	tabulationState => {
		return tabulationState.listLoading;
	}
);
export const selectTabulationActionLoading = createSelector(
	selectTabulationState,
	tabulationState => tabulationState.actionsloading
);
export const selectLastCreatedTabulationId = createSelector(
	selectTabulationState,
	tabulationState => tabulationState.lastCreatedTabulationId
);
export const selectTabulationPageLastQuery = createSelector(
	selectTabulationState,
	tabulationState => tabulationState.lastQuery
);
export const selectTabulationInStore = createSelector(
	selectTabulationState,
	tabulationState => {
		const items: TabulationModel[] = [];
		each(tabulationState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: TabulationModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, tabulationState.totalCount, '');
	}
);
export const selectTabulationShowInitWaitingMessage = createSelector(
	selectTabulationState,
	tabulationState => tabulationState.showInitWaitingMessage
);
export const selectHasTabulationInStore = createSelector(
	selectTabulationState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
