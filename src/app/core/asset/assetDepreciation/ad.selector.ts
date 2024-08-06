// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { AdState } from './ad.reducer';
import { each } from 'lodash';
import { AdModel } from './ad.model';


export const selectAdState = createFeatureSelector<AdState>('ad');

export const selectAdById = (adId: string) => createSelector(
	selectAdState,
	adState =>  adState.entities[adId]
);

export const selectAdPageLoading = createSelector(
	selectAdState,
	adState => {
		return adState.listLoading;
	}
);

export const selectAdActionLoading = createSelector(
	selectAdState,
	adState => adState.actionsloading
);

export const selectLastCreatedAdId = createSelector(
	selectAdState,
	adState => adState.lastCreatedAdId
);

export const selectAdPageLastQuery = createSelector(
	selectAdState,
	adState => adState.lastQuery
);

export const selectAdInStore = createSelector(
	selectAdState,
	adState => {
		const items: AdModel[] = [];
		each(adState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: AdModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, adState.totalCount, '');
	}
);

export const selectAdShowInitWaitingMessage = createSelector(
	selectAdState,
	adState => adState.showInitWaitingMessage
);

export const selectHasAdInStore = createSelector(
	selectAdState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
