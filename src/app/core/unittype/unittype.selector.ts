// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { UnitTypeState } from './unittype.reducer';
import { each } from 'lodash';
import { UnitTypeModel } from './unittype.model';


export const selectUnitTypeState = createFeatureSelector<UnitTypeState>('unittype');

export const selectUnitTypeById = (unittypeId: string) => createSelector(
	selectUnitTypeState,
	unittypeState =>  unittypeState.entities[unittypeId]
);

export const selectUnitTypePageLoading = createSelector(
	selectUnitTypeState,
	unittypeState => {
		return unittypeState.listLoading;
	}
);

export const selectUnitTypeActionLoading = createSelector(
	selectUnitTypeState,
	unittypeState => unittypeState.actionsloading
);

export const selectLastCreatedUnitTypeId = createSelector(
	selectUnitTypeState,
	unittypeState => unittypeState.lastCreatedUnitTypeId
);

export const selectUnitTypePageLastQuery = createSelector(
	selectUnitTypeState,
	unittypeState => unittypeState.lastQuery
);

export const selectUnitTypeInStore = createSelector(
	selectUnitTypeState,
	unittypeState => {
		const items: UnitTypeModel[] = [];
		each(unittypeState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: UnitTypeModel[] = httpExtension.sortArray(items, unittypeState.lastQuery.sortField, unittypeState.lastQuery.sortOrder);
		return new QueryResultsModel(result, unittypeState.totalCount, '');
	}
);

export const selectUnitTypeShowInitWaitingMessage = createSelector(
	selectUnitTypeState,
	unittypeState => unittypeState.showInitWaitingMessage
);

export const selectHasUnitTypeInStore = createSelector(
	selectUnitTypeState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
