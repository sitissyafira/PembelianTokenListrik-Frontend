// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../../_base/crud';
// State
import { UomState } from './uom.reducer';
import { each } from 'lodash';
import { UomModel } from './uom.model';


export const selectUomState = createFeatureSelector<UomState>('uom');

export const selectUomById = (uomId: string) => createSelector(
	selectUomState,
	uomState =>  uomState.entities[uomId]
);

export const selectUomPageLoading = createSelector(
	selectUomState,
	uomState => {
		return uomState.listLoading;
	}
);

export const selectUomActionLoading = createSelector(
	selectUomState,
	uomState => uomState.actionsloading
);

export const selectLastCreatedUomId = createSelector(
	selectUomState,
	uomState => uomState.lastCreatedUomId
);

export const selectUomPageLastQuery = createSelector(
	selectUomState,
	uomState => uomState.lastQuery
);

export const selectUomInStore = createSelector(
	selectUomState,
	uomState => {
		const items: UomModel[] = [];
		each(uomState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: UomModel[] = httpExtension.sortArray(items, uomState.lastQuery.sortField, uomState.lastQuery.sortOrder);
		return new QueryResultsModel(result, uomState.totalCount, '');
	}
);

export const selectUomShowInitWaitingMessage = createSelector(
	selectUomState,
	uomState => uomState.showInitWaitingMessage
);

export const selectHasUomInStore = createSelector(
	selectUomState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
