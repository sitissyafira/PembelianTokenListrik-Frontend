// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { RentalState } from './rental.reducer';
import { each } from 'lodash';
import { RentalModel } from './rental.model';


export const selectRentalState = createFeatureSelector<RentalState>('rental');

export const selectRentalById = (rentalId: string) => createSelector(
	selectRentalState,
	rentalState =>  rentalState.entities[rentalId]
);

export const selectRentalPageLoading = createSelector(
	selectRentalState,
	rentalState => {
		return rentalState.listLoading;
	}
);

export const selectRentalActionLoading = createSelector(
	selectRentalState,
	rentalState => rentalState.actionsloading
);

export const selectLastCreatedRentalId = createSelector(
	selectRentalState,
	rentalState => rentalState.lastCreatedRentalId
);

export const selectRentalPageLastQuery = createSelector(
	selectRentalState,
	rentalState => rentalState.lastQuery
);

export const selectRentalInStore = createSelector(
	selectRentalState,
	rentalState => {
		const items: RentalModel[] = [];
		each(rentalState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: RentalModel[] = httpExtension.sortArray(items, rentalState.lastQuery.sortField, rentalState.lastQuery.sortOrder);
		return new QueryResultsModel(result, rentalState.totalCount, '');
	}
);

export const selectRentalShowInitWaitingMessage = createSelector(
	selectRentalState,
	rentalState => rentalState.showInitWaitingMessage
);

export const selectHasRentalInStore = createSelector(
	selectRentalState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
