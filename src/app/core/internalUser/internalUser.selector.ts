import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
import { InternalUserState } from './internalUser.reducer';
import { each } from 'lodash';
import { InternalUserModel } from './internalUser.model';


export const selectInternalUserState = createFeatureSelector<InternalUserState>('internalUser');

export const selectInternalUserById = (internalUserId: string) => createSelector(
	selectInternalUserState,
	internalUserState =>  internalUserState.entities[internalUserId]
);

export const selectInternalUserPageLoading = createSelector(
	selectInternalUserState,
	internalUserState => {
		return internalUserState.listLoading;
	}
);

export const selectInternalUserActionLoading = createSelector(
	selectInternalUserState,
	internalUserState => internalUserState.actionsloading
);

export const selectLastCreatedInternalUserId = createSelector(
	selectInternalUserState,
	internalUserState => internalUserState.lastCreatedInternalUserId
);

export const selectInternalUserPageLastQuery = createSelector(
	selectInternalUserState,
	internalUserState => internalUserState.lastQuery
);

export const selectInternalUserInStore = createSelector(
	selectInternalUserState,
	internalUserState => {
		const items: InternalUserModel[] = [];
		each(internalUserState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: InternalUserModel[] = httpExtension.sortArray(items, internalUserState.lastQuery.sortField, internalUserState.lastQuery.sortOrder);
		return new QueryResultsModel(result, internalUserState.totalCount, '');
	}
);

export const selectInternalUserShowInitWaitingMessage = createSelector(
	selectInternalUserState,
	internalUserState => internalUserState.showInitWaitingMessage
);

export const selectHasInternalUserInStore = createSelector(
	selectInternalUserState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
