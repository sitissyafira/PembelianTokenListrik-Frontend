// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { ApplicationState } from './application.reducer';
import { each } from 'lodash';
import { ApplicationModel } from './application.model';


export const selectApplicationState = createFeatureSelector<ApplicationState>('application');

export const selectApplicationById = (applicationId: string) => createSelector(
	selectApplicationState,
	applicationState =>  applicationState.entities[applicationId]
);

export const selectApplicationPageLoading = createSelector(
	selectApplicationState,
	applicationState => {
		return applicationState.listLoading;
	}
);

export const selectApplicationActionLoading = createSelector(
	selectApplicationState,
	applicationState => applicationState.actionsloading
);

export const selectLastCreatedApplicationId = createSelector(
	selectApplicationState,
	applicationState => applicationState.lastCreatedApplicationId
);

export const selectApplicationPageLastQuery = createSelector(
	selectApplicationState,
	applicationState => applicationState.lastQuery
);

export const selectApplicationInStore = createSelector(
	selectApplicationState,
	applicationState => {
		const items: ApplicationModel[] = [];
		each(applicationState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: ApplicationModel[] = httpExtension.sortArray(items, applicationState.lastQuery.sortField, applicationState.lastQuery.sortOrder);
		return new QueryResultsModel(result, applicationState.totalCount, '');
	}
);

export const selectApplicationShowInitWaitingMessage = createSelector(
	selectApplicationState,
	applicationState => applicationState.showInitWaitingMessage
);

export const selectHasApplicationInStore = createSelector(
	selectApplicationState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
