import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
import { ApState } from './ap.reducer';
import { each } from 'lodash';
import { ApModel } from './ap.model';


export const selectApState = createFeatureSelector<ApState>('ap');

export const selectApById = (apId: string) => createSelector(
	selectApState,
	apState =>  apState.entities[apId]
);
export const selectApPageLoading = createSelector(
	selectApState,
	apState => {
		return apState.listLoading;
	}
);
export const selectApActionLoading = createSelector(
	selectApState,
	apState => apState.actionsloading
);
export const selectLastCreatedApId = createSelector(
	selectApState,
	apState => apState.lastCreatedApId
);
export const selectApPageLastQuery = createSelector(
	selectApState,
	apState => apState.lastQuery
);
export const selectApInStore = createSelector(
	selectApState,
	apState => {
		const items: ApModel[] = [];
		each(apState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: ApModel[] = httpExtension.sortArray(items, apState.lastQuery.sortField, apState.lastQuery.sortOrder);
		return new QueryResultsModel(result, apState.totalCount, '');
	}
);
export const selectApShowInitWaitingMessage = createSelector(
	selectApState,
	apState => apState.showInitWaitingMessage
);
export const selectHasApInStore = createSelector(
	selectApState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
