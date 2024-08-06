// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { AddparkState } from './addpark.reducer';
import { each } from 'lodash';
import { AddparkModel } from './addpark.model';


export const selectAddparkState = createFeatureSelector<AddparkState>('addpark');

export const selectAddparkById = (addparkId: string) => createSelector(
	selectAddparkState,
	addparkState =>  addparkState.entities[addparkId]
);

export const selectAddparkPageLoading = createSelector(
	selectAddparkState,
	addparkState => {
		return addparkState.listLoading;
	}
);

export const selectAddparkActionLoading = createSelector(
	selectAddparkState,
	addparkState => addparkState.actionsloading
);

export const selectLastCreatedAddparkId = createSelector(
	selectAddparkState,
	addparkState => addparkState.lastCreatedAddparkId
);

export const selectAddparkPageLastQuery = createSelector(
	selectAddparkState,
	addparkState => addparkState.lastQuery
);

export const selectAddparkInStore = createSelector(
	selectAddparkState,
	addparkState => {
		const items: AddparkModel[] = [];
		each(addparkState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: AddparkModel[] = httpExtension.sortArray(items, addparkState.lastQuery.sortField, addparkState.lastQuery.sortOrder);
		return new QueryResultsModel(result, addparkState.totalCount, '');
	}
);

export const selectAddparkShowInitWaitingMessage = createSelector(
	selectAddparkState,
	addparkState => addparkState.showInitWaitingMessage
);

export const selectHasAddparkInStore = createSelector(
	selectAddparkState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
