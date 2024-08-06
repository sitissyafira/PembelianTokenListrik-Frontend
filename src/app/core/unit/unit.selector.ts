// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { UnitState } from './unit.reducer';
import { each } from 'lodash';
import { UnitModel } from './unit.model';


export const selectUnitState = createFeatureSelector<UnitState>('unit');

export const selectUnitById = (unitId: string) => createSelector(
	selectUnitState,
	unitState =>  unitState.entities[unitId]
);

export const selectUnitPageLoading = createSelector(
	selectUnitState,
	unitState => {
		return unitState.listLoading;
	}
);

export const selectUnitActionLoading = createSelector(
	selectUnitState,
	unitState => unitState.actionsloading
);

export const selectLastCreatedUnitId = createSelector(
	selectUnitState,
	unitState => unitState.lastCreatedUnitId
);

export const selectUnitPageLastQuery = createSelector(
	selectUnitState,
	unitState => unitState.lastQuery
);

export const selectUnitInStore = createSelector(
	selectUnitState,
	unitState => {
		const items: UnitModel[] = [];
		each(unitState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: UnitModel[] = httpExtension.sortArray(items, unitState.lastQuery.sortField, unitState.lastQuery.sortOrder);
		return new QueryResultsModel(result, unitState.totalCount, '');
	}
);

export const selectUnitShowInitWaitingMessage = createSelector(
	selectUnitState,
	unitState => unitState.showInitWaitingMessage
);

export const selectHasUnitInStore = createSelector(
	selectUnitState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
