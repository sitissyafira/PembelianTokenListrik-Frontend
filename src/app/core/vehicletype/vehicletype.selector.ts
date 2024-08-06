// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { VehicleTypeState } from './vehicletype.reducer';
import { each } from 'lodash';
import { VehicleTypeModel } from './vehicletype.model';


export const selectVehicleTypeState = createFeatureSelector<VehicleTypeState>('vehicletype');

export const selectVehicleTypeById = (vehicletypeId: string) => createSelector(
	selectVehicleTypeState,
	vehicletypeState =>  vehicletypeState.entities[vehicletypeId]
);

export const selectVehicleTypePageLoading = createSelector(
	selectVehicleTypeState,
	vehicletypeState => {
		return vehicletypeState.listLoading;
	}
);

export const selectVehicleTypeActionLoading = createSelector(
	selectVehicleTypeState,
	vehicletypeState => vehicletypeState.actionsloading
);

export const selectLastCreatedVehicleTypeId = createSelector(
	selectVehicleTypeState,
	vehicletypeState => vehicletypeState.lastCreatedVehicleTypeId
);

export const selectVehicleTypePageLastQuery = createSelector(
	selectVehicleTypeState,
	vehicletypeState => vehicletypeState.lastQuery
);

export const selectVehicleTypeInStore = createSelector(
	selectVehicleTypeState,
	vehicletypeState => {
		const items: VehicleTypeModel[] = [];
		each(vehicletypeState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: VehicleTypeModel[] = httpExtension.sortArray(items, vehicletypeState.lastQuery.sortField, vehicletypeState.lastQuery.sortOrder);
		return new QueryResultsModel(result, vehicletypeState.totalCount, '');
	}
);

export const selectVehicleTypeShowInitWaitingMessage = createSelector(
	selectVehicleTypeState,
	vehicletypeState => vehicletypeState.showInitWaitingMessage
);

export const selectHasVehicleTypeInStore = createSelector(
	selectVehicleTypeState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
