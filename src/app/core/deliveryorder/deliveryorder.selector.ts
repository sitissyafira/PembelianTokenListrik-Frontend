// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { DeliveryorderState } from './deliveryorder.reducer';
import { each } from 'lodash';
import { DeliveryorderModel } from './deliveryorder.model';


export const selectDeliveryorderState = createFeatureSelector<DeliveryorderState>('deliveryorder');

export const selectDeliveryorderById = (deliveryorderId: string) => createSelector(
	selectDeliveryorderState,
	deliveryorderState =>  deliveryorderState.entities[deliveryorderId]
);

export const selectDeliveryorderPageLoading = createSelector(
	selectDeliveryorderState,
	deliveryorderState => {
		return deliveryorderState.listLoading;
	}
);

export const selectDeliveryorderActionLoading = createSelector(
	selectDeliveryorderState,
	deliveryorderState => deliveryorderState.actionsloading
);

export const selectLastCreatedDeliveryorderId = createSelector(
	selectDeliveryorderState,
	deliveryorderState => deliveryorderState.lastCreatedDeliveryorderId
);

export const selectDeliveryorderPageLastQuery = createSelector(
	selectDeliveryorderState,
	deliveryorderState => deliveryorderState.lastQuery
);

export const selectDeliveryorderInStore = createSelector(
	selectDeliveryorderState,
	deliveryorderState => {
		const items: DeliveryorderModel[] = [];
		each(deliveryorderState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: DeliveryorderModel[] = httpExtension.sortArray(items, deliveryorderState.lastQuery.sortField, deliveryorderState.lastQuery.sortOrder);
		return new QueryResultsModel(result, deliveryorderState.totalCount, '');
	}
);

export const selectDeliveryorderShowInitWaitingMessage = createSelector(
	selectDeliveryorderState,
	deliveryorderState => deliveryorderState.showInitWaitingMessage
);

export const selectHasDeliveryorderInStore = createSelector(
	selectDeliveryorderState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
