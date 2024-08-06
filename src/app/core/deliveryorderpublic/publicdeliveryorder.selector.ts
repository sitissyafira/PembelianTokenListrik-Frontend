// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { PublicDeliveryorderState } from './publicdeliveryorder.reducer';
import { each } from 'lodash';
import { PublicDeliveryorderModel } from './publicdeliveryorder.model';


export const selectPublicDeliveryorderState = createFeatureSelector<PublicDeliveryorderState>('publicDeliveryorder');

export const selectPublicDeliveryorderById = (publicDeliveryorderId: string) => createSelector(
	selectPublicDeliveryorderState,
	publicDeliveryorderState =>  publicDeliveryorderState.entities[publicDeliveryorderId]
);

export const selectPublicDeliveryorderPageLoading = createSelector(
	selectPublicDeliveryorderState,
	publicDeliveryorderState => {
		return publicDeliveryorderState.listLoading;
	}
);

export const selectPublicDeliveryorderActionLoading = createSelector(
	selectPublicDeliveryorderState,
	publicDeliveryorderState => publicDeliveryorderState.actionsloading
);

export const selectLastCreatedPublicDeliveryorderId = createSelector(
	selectPublicDeliveryorderState,
	publicDeliveryorderState => publicDeliveryorderState.lastCreatedPublicDeliveryorderId
);

export const selectPublicDeliveryorderPageLastQuery = createSelector(
	selectPublicDeliveryorderState,
	publicDeliveryorderState => publicDeliveryorderState.lastQuery
);

export const selectPublicDeliveryorderInStore = createSelector(
	selectPublicDeliveryorderState,
	publicDeliveryorderState => {
		const items: PublicDeliveryorderModel[] = [];
		each(publicDeliveryorderState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: PublicDeliveryorderModel[] = httpExtension.sortArray(items, publicDeliveryorderState.lastQuery.sortField, publicDeliveryorderState.lastQuery.sortOrder);
		return new QueryResultsModel(result, publicDeliveryorderState.totalCount, '');
	}
);

export const selectPublicDeliveryorderShowInitWaitingMessage = createSelector(
	selectPublicDeliveryorderState,
	publicDeliveryorderState => publicDeliveryorderState.showInitWaitingMessage
);

export const selectHasPublicDeliveryorderInStore = createSelector(
	selectPublicDeliveryorderState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
