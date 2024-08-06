import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
import { LocationBuildingState } from './locationBuilding.reducer';
import { each } from 'lodash';
import { LocationBuildingModel } from './locationBuilding.model';


export const selectLocationBuildingState = createFeatureSelector<LocationBuildingState>('locationBuilding');

export const selectLocationBuildingById = (locationBuildingId: string) => createSelector(
	selectLocationBuildingState,
	locationBuildingState =>  locationBuildingState.entities[locationBuildingId]
);
export const selectLocationBuildingPageLoading = createSelector(
	selectLocationBuildingState,
	locationBuildingState => {
		return locationBuildingState.listLoading;
	}
);
export const selectLocationBuildingActionLoading = createSelector(
	selectLocationBuildingState,
	locationBuildingState => locationBuildingState.actionsloading
);
export const selectLastCreatedLocationBuildingId = createSelector(
	selectLocationBuildingState,
	locationBuildingState => locationBuildingState.lastCreatedLocationBuildingId
);
export const selectLocationBuildingPageLastQuery = createSelector(
	selectLocationBuildingState,
	locationBuildingState => locationBuildingState.lastQuery
);
export const selectLocationBuildingInStore = createSelector(
	selectLocationBuildingState,
	locationBuildingState => {
		const items: LocationBuildingModel[] = [];
		each(locationBuildingState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: LocationBuildingModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, locationBuildingState.totalCount, '');
	}
);
export const selectLocationBuildingShowInitWaitingMessage = createSelector(
	selectLocationBuildingState,
	locationBuildingState => locationBuildingState.showInitWaitingMessage
);
export const selectHasLocationBuildingInStore = createSelector(
	selectLocationBuildingState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
