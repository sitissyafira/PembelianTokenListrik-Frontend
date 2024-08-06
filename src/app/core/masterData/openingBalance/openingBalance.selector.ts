// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { OpeningBalanceState } from './openingBalance.reducer';
import { each } from 'lodash';
import { OpeningBalanceModel } from './openingBalance.model';


export const selectOpeningBalanceState = createFeatureSelector<OpeningBalanceState>('openingBalance');

export const selectOpeningBalanceById = (openingBalanceId: string) => createSelector(
	selectOpeningBalanceState,
	openingBalanceState =>  openingBalanceState.entities[openingBalanceId]
);

export const selectOpeningBalancePageLoading = createSelector(
	selectOpeningBalanceState,
	openingBalanceState => {
		return openingBalanceState.listLoading;
	}
);

export const selectOpeningBalanceActionLoading = createSelector(
	selectOpeningBalanceState,
	openingBalanceState => openingBalanceState.actionsloading
);

export const selectLastCreatedOpeningBalanceId = createSelector(
	selectOpeningBalanceState,
	openingBalanceState => openingBalanceState.lastCreatedOpeningBalanceId
);

export const selectOpeningBalancePageLastQuery = createSelector(
	selectOpeningBalanceState,
	openingBalanceState => openingBalanceState.lastQuery
);

export const selectOpeningBalanceInStore = createSelector(
	selectOpeningBalanceState,
	openingBalanceState => {
		const items: OpeningBalanceModel[] = [];
		each(openingBalanceState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: OpeningBalanceModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, openingBalanceState.totalCount, '');
	}
);

export const selectOpeningBalanceShowInitWaitingMessage = createSelector(
	selectOpeningBalanceState,
	openingBalanceState => openingBalanceState.showInitWaitingMessage
);

export const selectHasOpeningBalanceInStore = createSelector(
	selectOpeningBalanceState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
