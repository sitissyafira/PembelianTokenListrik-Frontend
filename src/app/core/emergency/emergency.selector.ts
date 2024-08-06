import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
import { EmergencyState } from './emergency.reducer';
import { each } from 'lodash';
import { EmergencyModel } from './emergency.model';


export const selectEmergencyState = createFeatureSelector<EmergencyState>('emergency');

export const selectEmergencyById = (emergencyId: string) => createSelector(
	selectEmergencyState,
	emergencyState =>  emergencyState.entities[emergencyId]
);

export const selectEmergencyPageLoading = createSelector(
	selectEmergencyState,
	emergencyState => {
		return emergencyState.listLoading;
	}
);

export const selectEmergencyActionLoading = createSelector(
	selectEmergencyState,
	emergencyState => emergencyState.actionsloading
);

export const selectLastCreatedEmergencyId = createSelector(
	selectEmergencyState,
	emergencyState => emergencyState.lastCreatedEmergencyId
);

export const selectEmergencyPageLastQuery = createSelector(
	selectEmergencyState,
	emergencyState => emergencyState.lastQuery
);

export const selectEmergencyInStore = createSelector(
	selectEmergencyState,
	emergencyState => {
		const items: EmergencyModel[] = [];
		each(emergencyState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: EmergencyModel[] = httpExtension.sortArray(items, emergencyState.lastQuery.sortField, emergencyState.lastQuery.sortOrder);
		return new QueryResultsModel(result, emergencyState.totalCount, '');
	}
);

export const selectEmergencyShowInitWaitingMessage = createSelector(
	selectEmergencyState,
	emergencyState => emergencyState.showInitWaitingMessage
);

export const selectHasEmergencyInStore = createSelector(
	selectEmergencyState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
