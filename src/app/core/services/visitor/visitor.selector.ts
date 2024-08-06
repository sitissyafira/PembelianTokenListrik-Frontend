// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { VisitorState } from './visitor.reducer';
import { each } from 'lodash';
import { VisitorModel } from './visitor.model';


export const selectVisitorState = createFeatureSelector<VisitorState>('visitor');

export const selectVisitorById = (visitorId: string) => createSelector(
	selectVisitorState,
	visitorState =>  visitorState.entities[visitorId]
);

export const selectVisitorPageLoading = createSelector(
	selectVisitorState,
	visitorState => {
		return visitorState.listLoading;
	}
);

export const selectVisitorActionLoading = createSelector(
	selectVisitorState,
	visitorState => visitorState.actionsloading
);

export const selectLastCreatedVisitorId = createSelector(
	selectVisitorState,
	visitorState => visitorState.lastCreatedVisitorId
);

export const selectVisitorPageLastQuery = createSelector(
	selectVisitorState,
	visitorState => visitorState.lastQuery
);

export const selectVisitorInStore = createSelector(
	selectVisitorState,
	visitorState => {
		const items: VisitorModel[] = [];
		each(visitorState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: VisitorModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, visitorState.totalCount, '');
	}
);

export const selectVisitorShowInitWaitingMessage = createSelector(
	selectVisitorState,
	visitorState => visitorState.showInitWaitingMessage
);

export const selectHasVisitorInStore = createSelector(
	selectVisitorState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
