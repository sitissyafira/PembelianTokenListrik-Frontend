import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
import { PettyCastState } from './pettyCast.reducer';
import { each } from 'lodash';
import { PettyCastModel } from './pettyCast.model';

export const selectPettyCastState = createFeatureSelector<PettyCastState>('pettyCast');
export const selectPettyCastById = (pettyCastId: string) => createSelector(
	selectPettyCastState,
	pettyCastState =>  pettyCastState.entities[pettyCastId]
);
export const selectPettyCastPageLoading = createSelector(
	selectPettyCastState,
	pettyCastState => {
		return pettyCastState.listLoading;
	}
);
export const selectPettyCastActionLoading = createSelector(
	selectPettyCastState,
	pettyCastState => pettyCastState.actionsloading
);
export const selectLastCreatedPettyCastId = createSelector(
	selectPettyCastState,
	pettyCastState => pettyCastState.lastCreatedPettyCastId
);
export const selectPettyCastPageLastQuery = createSelector(
	selectPettyCastState,
	pettyCastState => pettyCastState.lastQuery
);
export const selectPettyCastInStore = createSelector(
	selectPettyCastState,
	pettyCastState => {
		const items: PettyCastModel[] = [];
		each(pettyCastState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: PettyCastModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, pettyCastState.totalCount, '');
	}
);
export const selectPettyCastShowInitWaitingMessage = createSelector(
	selectPettyCastState,
	pettyCastState => pettyCastState.showInitWaitingMessage
);
export const selectHasPettyCastInStore = createSelector(
	selectPettyCastState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
