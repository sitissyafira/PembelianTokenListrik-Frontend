// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { FloorState } from './floor.reducer';
import { each } from 'lodash';
import { FloorModel } from './floor.model';


export const selectFloorState = createFeatureSelector<FloorState>('floor');

export const selectFloorById = (floorId: string) => createSelector(
	selectFloorState,
	floorState =>  floorState.entities[floorId]
);

export const selectFloorPageLoading = createSelector(
	selectFloorState,
	floorState => {
		return floorState.listLoading;
	}
);

export const selectFloorActionLoading = createSelector(
	selectFloorState,
	floorState => floorState.actionsloading
);

export const selectLastCreatedFloorId = createSelector(
	selectFloorState,
	floorState => floorState.lastCreatedFloorId
);

export const selectFloorPageLastQuery = createSelector(
	selectFloorState,
	floorState => floorState.lastQuery
);

export const selectFloorInStore = createSelector(
	selectFloorState,
	floorState => {
		const items: FloorModel[] = [];
		each(floorState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: FloorModel[] = httpExtension.sortArray(items, floorState.lastQuery.sortField, floorState.lastQuery.sortOrder);
		return new QueryResultsModel(result, floorState.totalCount, '');
	}
);

export const selectFloorShowInitWaitingMessage = createSelector(
	selectFloorState,
	floorState => floorState.showInitWaitingMessage
);

export const selectHasFloorInStore = createSelector(
	selectFloorState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
