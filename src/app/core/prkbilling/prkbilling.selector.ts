// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { PrkbillingState } from './prkbilling.reducer';
import { each } from 'lodash';
import { PrkbillingModel } from './prkbilling.model';


export const selectPrkbillingState = createFeatureSelector<PrkbillingState>('prkbilling');

export const selectPrkbillingById = (prkbillingId: string) => createSelector(
	selectPrkbillingState,
	prkbillingState =>  prkbillingState.entities[prkbillingId]
);

export const selectPrkbillingPageLoading = createSelector(
	selectPrkbillingState,
	prkbillingState => {
		return prkbillingState.listLoading;
	}
);

export const selectPrkbillingActionLoading = createSelector(
	selectPrkbillingState,
	prkbillingState => prkbillingState.actionsloading
);

export const selectLastCreatedPrkbillingId = createSelector(
	selectPrkbillingState,
	prkbillingState => prkbillingState.lastCreatedPrkbillingId
);

export const selectPrkbillingPageLastQuery = createSelector(
	selectPrkbillingState,
	prkbillingState => prkbillingState.lastQuery
);

export const selectPrkbillingInStore = createSelector(
	selectPrkbillingState,
	prkbillingState => {
		const items: PrkbillingModel[] = [];
		each(prkbillingState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: PrkbillingModel[] = httpExtension.sortArray(items, prkbillingState.lastQuery.sortField, prkbillingState.lastQuery.sortOrder);
		return new QueryResultsModel(result, prkbillingState.totalCount, '');
	}
);

export const selectPrkbillingShowInitWaitingMessage = createSelector(
	selectPrkbillingState,
	prkbillingState => prkbillingState.showInitWaitingMessage
);

export const selectHasPrkbillingInStore = createSelector(
	selectPrkbillingState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
