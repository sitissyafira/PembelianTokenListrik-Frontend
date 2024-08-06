// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { EngineerState } from './engineer.reducer';
import { each } from 'lodash';
import { EngineerModel } from './engineer.model';


export const selectEngineerState = createFeatureSelector<EngineerState>('engineer');

export const selectEngineerById = (engineerId: string) => createSelector(
	selectEngineerState,
	engineerState =>  engineerState.entities[engineerId]
);

export const selectEngineerPageLoading = createSelector(
	selectEngineerState,
	engineerState => {
		return engineerState.listLoading;
	}
);

export const selectEngineerActionLoading = createSelector(
	selectEngineerState,
	engineerState => engineerState.actionsloading
);

export const selectLastCreatedEngineerId = createSelector(
	selectEngineerState,
	engineerState => engineerState.lastCreatedEngineerId
);

export const selectEngineerPageLastQuery = createSelector(
	selectEngineerState,
	engineerState => engineerState.lastQuery
);

export const selectEngineerInStore = createSelector(
	selectEngineerState,
	engineerState => {
		const items: EngineerModel[] = [];
		each(engineerState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: EngineerModel[] = httpExtension.sortArray(items, engineerState.lastQuery.sortField, engineerState.lastQuery.sortOrder);
		return new QueryResultsModel(result, engineerState.totalCount, '');
	}
);

export const selectEngineerShowInitWaitingMessage = createSelector(
	selectEngineerState,
	engineerState => engineerState.showInitWaitingMessage
);

export const selectHasEngineerInStore = createSelector(
	selectEngineerState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
