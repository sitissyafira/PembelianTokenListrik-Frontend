import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
import { ExternalUserState } from './externalUser.reducer';
import { each } from 'lodash';
import { ExternalUserModel } from './externalUser.model';


export const selectExternalUserState = createFeatureSelector<ExternalUserState>('externalUser');

export const selectExternalUserById = (externalUserId: string) => createSelector(
	selectExternalUserState,
	externalUserState =>  externalUserState.entities[externalUserId]
);

export const selectExternalUserPageLoading = createSelector(
	selectExternalUserState,
	externalUserState => {
		return externalUserState.listLoading;
	}
);

export const selectExternalUserActionLoading = createSelector(
	selectExternalUserState,
	externalUserState => externalUserState.actionsloading
);

export const selectLastCreatedExternalUserId = createSelector(
	selectExternalUserState,
	externalUserState => externalUserState.lastCreatedExternalUserId
);

export const selectExternalUserPageLastQuery = createSelector(
	selectExternalUserState,
	externalUserState => externalUserState.lastQuery
);

export const selectExternalUserInStore = createSelector(
	selectExternalUserState,
	externalUserState => {
		const items: ExternalUserModel[] = [];
		each(externalUserState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: ExternalUserModel[] = httpExtension.sortArray(items, externalUserState.lastQuery.sortField, externalUserState.lastQuery.sortOrder);
		return new QueryResultsModel(result, externalUserState.totalCount, '');
	}
);

export const selectExternalUserShowInitWaitingMessage = createSelector(
	selectExternalUserState,
	externalUserState => externalUserState.showInitWaitingMessage
);

export const selectHasExternalUserInStore = createSelector(
	selectExternalUserState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
