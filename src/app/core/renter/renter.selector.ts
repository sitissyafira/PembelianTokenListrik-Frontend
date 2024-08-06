import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
import { RenterState } from './renter.reducer';
import { each } from 'lodash';
import { RenterModel } from './renter.model';


export const selectRenterState = createFeatureSelector<RenterState>('renter');

export const selectRenterById = (renterId: string) => createSelector(
	selectRenterState,
	renterState => renterState.entities[renterId]
);

export const selectRenterPageLoading = createSelector(
	selectRenterState,
	renterState => {
		return renterState.listLoading;
	}
);

export const selectRenterActionLoading = createSelector(
	selectRenterState,
	renterState => renterState.actionsloading
);

export const selectLastCreatedRenterId = createSelector(
	selectRenterState,
	renterState => renterState.lastCreatedRenterId
);

export const selectRenterPageLastQuery = createSelector(
	selectRenterState,
	renterState => renterState.lastQuery
);

export const selectRenterInStore = createSelector(
	selectRenterState,
	renterState => {
		const items: RenterModel[] = [];
		each(renterState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: RenterModel[] = httpExtension.sortArray(items, renterState.lastQuery.sortField, renterState.lastQuery.sortOrder);
		return new QueryResultsModel(result, renterState.totalCount, '');
	}
);

export const selectRenterShowInitWaitingMessage = createSelector(
	selectRenterState,
	renterState => renterState.showInitWaitingMessage
);

export const selectHasRenterInStore = createSelector(
	selectRenterState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
