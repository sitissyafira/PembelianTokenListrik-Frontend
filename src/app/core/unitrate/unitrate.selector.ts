// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { UnitRateState } from './unitrate.reducer';
import { each } from 'lodash';
import { UnitRateModel } from './unitrate.model';


export const selectUnitRateState = createFeatureSelector<UnitRateState>('unitrate');

export const selectUnitRateById = (unitrateId: string) => createSelector(
	selectUnitRateState,
	unitrateState =>  unitrateState.entities[unitrateId]
);

export const selectUnitRatePageLoading = createSelector(
	selectUnitRateState,
	unitrateState => {
		return unitrateState.listLoading;
	}
);

export const selectUnitRateActionLoading = createSelector(
	selectUnitRateState,
	unitrateState => unitrateState.actionsloading
);

export const selectLastCreatedUnitRateId = createSelector(
	selectUnitRateState,
	unitrateState => unitrateState.lastCreatedUnitRateId
);

export const selectUnitRatePageLastQuery = createSelector(
	selectUnitRateState,
	unitrateState => unitrateState.lastQuery
);

export const selectUnitRateInStore = createSelector(
	selectUnitRateState,
	unitrateState => {
		const items: UnitRateModel[] = [];
		each(unitrateState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: UnitRateModel[] = httpExtension.sortArray(items, unitrateState.lastQuery.sortField, unitrateState.lastQuery.sortOrder);
		return new QueryResultsModel(result, unitrateState.totalCount, '');
	}
);

export const selectUnitRateShowInitWaitingMessage = createSelector(
	selectUnitRateState,
	unitrateState => unitrateState.showInitWaitingMessage
);

export const selectHasUnitRateInStore = createSelector(
	selectUnitRateState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
