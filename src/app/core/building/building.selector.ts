// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { BuildingState } from './building.reducer';
import { each } from 'lodash';
import { BuildingModel } from './building.model';


export const selectBuildingState = createFeatureSelector<BuildingState>('building');

export const selectBuildingById = (buildingId: string) => createSelector(
	selectBuildingState,
	buildingState =>  buildingState.entities[buildingId]
);

export const selectBuildingPageLoading = createSelector(
	selectBuildingState,
	buildingState => {
		return buildingState.listLoading;
	}
);

export const selectBuildingActionLoading = createSelector(
	selectBuildingState,
	buildingState => buildingState.actionsloading
);

export const selectLastCreatedBuildingId = createSelector(
	selectBuildingState,
	buildingState => buildingState.lastCreatedBuildingId
);

export const selectBuildingPageLastQuery = createSelector(
	selectBuildingState,
	buildingState => buildingState.lastQuery
);

export const selectBuildingInStore = createSelector(
	selectBuildingState,
	buildingState => {
		const items: BuildingModel[] = [];
		each(buildingState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: BuildingModel[] = httpExtension.sortArray(items, buildingState.lastQuery.sortField, buildingState.lastQuery.sortOrder);
		return new QueryResultsModel(result, buildingState.totalCount, '');
	}
);

export const selectBuildingShowInitWaitingMessage = createSelector(
	selectBuildingState,
	buildingState => buildingState.showInitWaitingMessage
);

export const selectHasBuildingInStore = createSelector(
	selectBuildingState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
