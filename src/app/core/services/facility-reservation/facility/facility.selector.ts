// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../../_base/crud';
// State
import { FacilityState } from './facility.reducer';
import { each } from 'lodash';
import { FacilityModel } from './facility.model';


export const selectFacilityState = createFeatureSelector<FacilityState>('facility');

export const selectFacilityById = (facilityId: string) => createSelector(
	selectFacilityState,
	facilityState => facilityState.entities[facilityId]
);

export const selectFacilityPageLoading = createSelector(
	selectFacilityState,
	facilityState => {
		return facilityState.listLoading;
	}
);

export const selectFacilityActionLoading = createSelector(
	selectFacilityState,
	facilityState => facilityState.actionsloading
);

export const selectLastCreatedFacilityId = createSelector(
	selectFacilityState,
	facilityState => facilityState.lastCreatedFacilityId
);

export const selectFacilityPageLastQuery = createSelector(
	selectFacilityState,
	facilityState => facilityState.lastQuery
);

export const selectFacilityInStore = createSelector(
	selectFacilityState,
	facilityState => {
		const items: FacilityModel[] = [];
		each(facilityState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: FacilityModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, facilityState.totalCount, '');
	}
);

export const selectFacilityShowInitWaitingMessage = createSelector(
	selectFacilityState,
	facilityState => facilityState.showInitWaitingMessage
);

export const selectHasFacilityInStore = createSelector(
	selectFacilityState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
