// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { PinjamPakaiState } from './pinjamPakai.reducer';
import { each } from 'lodash';
import { PinjamPakaiModel } from './pinjamPakai.model';


export const selectPinjamPakaiState = createFeatureSelector<PinjamPakaiState>('pinjamPakai');

export const selectPinjamPakaiById = (pinjamPakaiId: string) => createSelector(
	selectPinjamPakaiState,
	pinjamPakaiState =>  pinjamPakaiState.entities[pinjamPakaiId]
);

export const selectPinjamPakaiPageLoading = createSelector(
	selectPinjamPakaiState,
	pinjamPakaiState => {
		return pinjamPakaiState.listLoading;
	}
);

export const selectPinjamPakaiActionLoading = createSelector(
	selectPinjamPakaiState,
	pinjamPakaiState => pinjamPakaiState.actionsloading
);

export const selectLastCreatedPinjamPakaiId = createSelector(
	selectPinjamPakaiState,
	pinjamPakaiState => pinjamPakaiState.lastCreatedPinjamPakaiId
);

export const selectPinjamPakaiPageLastQuery = createSelector(
	selectPinjamPakaiState,
	pinjamPakaiState => pinjamPakaiState.lastQuery
);

export const selectPinjamPakaiInStore = createSelector(
	selectPinjamPakaiState,
	pinjamPakaiState => {
		const items: PinjamPakaiModel[] = [];
		each(pinjamPakaiState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: PinjamPakaiModel[] = httpExtension.sortArray(items, pinjamPakaiState.lastQuery.sortField, pinjamPakaiState.lastQuery.sortOrder);
		return new QueryResultsModel(result, pinjamPakaiState.totalCount, '');
	}
);

export const selectPinjamPakaiShowInitWaitingMessage = createSelector(
	selectPinjamPakaiState,
	pinjamPakaiState => pinjamPakaiState.showInitWaitingMessage
);

export const selectHasPinjamPakaiInStore = createSelector(
	selectPinjamPakaiState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
