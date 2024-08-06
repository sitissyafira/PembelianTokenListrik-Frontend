// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { ParkingState } from './parking.reducer';
import { each } from 'lodash';
import { ParkingModel } from './parking.model';


export const selectParkingState = createFeatureSelector<ParkingState>('parking');

export const selectParkingById = (parkingId: string) => createSelector(
	selectParkingState,
	parkingState =>  parkingState.entities[parkingId]
);

export const selectParkingPageLoading = createSelector(
	selectParkingState,
	parkingState => {
		return parkingState.listLoading;
	}
);

export const selectParkingActionLoading = createSelector(
	selectParkingState,
	parkingState => parkingState.actionsloading
);

export const selectLastCreatedParkingId = createSelector(
	selectParkingState,
	parkingState => parkingState.lastCreatedParkingId
);

export const selectParkingPageLastQuery = createSelector(
	selectParkingState,
	parkingState => parkingState.lastQuery
);

export const selectParkingInStore = createSelector(
	selectParkingState,
	parkingState => {
		const items: ParkingModel[] = [];
		each(parkingState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: ParkingModel[] = httpExtension.sortArray(items, parkingState.lastQuery.sortField, parkingState.lastQuery.sortOrder);
		return new QueryResultsModel(result, parkingState.totalCount, '');
	}
);

export const selectParkingShowInitWaitingMessage = createSelector(
	selectParkingState,
	parkingState => parkingState.showInitWaitingMessage
);

export const selectHasParkingInStore = createSelector(
	selectParkingState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
