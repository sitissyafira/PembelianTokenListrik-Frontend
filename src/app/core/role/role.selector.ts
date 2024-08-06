// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { RoleState } from './role.reducer';
import { each } from 'lodash';
import { RoleModel } from './role.model';


export const selectRoleState = createFeatureSelector<RoleState>('role');

export const selectRoleById = (roleId: string) => createSelector(
	selectRoleState,
	roleState =>  roleState.entities[roleId]
);

export const selectRolePageLoading = createSelector(
	selectRoleState,
	roleState => {
		return roleState.listLoading;
	}
);

export const selectRoleActionLoading = createSelector(
	selectRoleState,
	roleState => roleState.actionsloading
);

export const selectLastCreatedRoleId = createSelector(
	selectRoleState,
	roleState => roleState.lastCreatedRoleId
);

export const selectRolePageLastQuery = createSelector(
	selectRoleState,
	roleState => roleState.lastQuery
);

export const selectRoleInStore = createSelector(
	selectRoleState,
	roleState => {
		const items: RoleModel[] = [];
		each(roleState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: RoleModel[] = httpExtension.sortArray(items, roleState.lastQuery.sortField, roleState.lastQuery.sortOrder);
		return new QueryResultsModel(result, roleState.totalCount, '');
	}
);

export const selectRoleShowInitWaitingMessage = createSelector(
	selectRoleState,
	roleState => roleState.showInitWaitingMessage
);

export const selectHasRoleInStore = createSelector(
	selectRoleState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
