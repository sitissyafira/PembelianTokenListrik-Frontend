// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { LogactionState } from './logaction.reducer';
import { each } from 'lodash';
import { LogactionModel } from './logaction.model';


export const selectLogactionState = createFeatureSelector<LogactionState>('logaction');

export const selectLogactionById = (logactionId: string) => createSelector(
	selectLogactionState,
	logactionState =>  logactionState.entities[logactionId]
);

export const selectLogactionPageLoading = createSelector(
	selectLogactionState,
	logactionState => {
		return logactionState.listLoading;
	}
);

export const selectLogactionActionLoading = createSelector(
	selectLogactionState,
	logactionState => logactionState.actionsloading
);

export const selectLastCreatedLogactionId = createSelector(
	selectLogactionState,
	logactionState => logactionState.lastCreatedLogactionId
);

export const selectLogactionPageLastQuery = createSelector(
	selectLogactionState,
	logactionState => logactionState.lastQuery
);

export const selectLogactionInStore = createSelector(
	selectLogactionState,
	logactionState => {
		const items: LogactionModel[] = [];
		each(logactionState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: LogactionModel[] = httpExtension.sortArray(items, '', 'asc');
		return new QueryResultsModel(result, logactionState.totalCount, '');
	}
);

export const selectLogactionShowInitWaitingMessage = createSelector(
	selectLogactionState,
	logactionState => logactionState.showInitWaitingMessage
);

export const selectHasLogactionInStore = createSelector(
	selectLogactionState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
