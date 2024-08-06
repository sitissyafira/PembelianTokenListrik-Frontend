// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../../_base/crud';
// State
import { AmortizationState } from './amortization.reducer';
import { each } from 'lodash';
import { AmortizationModel } from './amortization.model';


export const selectAmortizationState = createFeatureSelector<AmortizationState>('amortization');

export const selectAmortizationById = (amortizationId: string) => createSelector(
	selectAmortizationState,
	amortizationState => amortizationState.entities[amortizationId]
);

export const selectAmortizationPageLoading = createSelector(
	selectAmortizationState,
	amortizationState => {
		return amortizationState.listLoading;
	}
);

export const selectAmortizationActionLoading = createSelector(
	selectAmortizationState,
	amortizationState => amortizationState.actionsloading
);

export const selectLastCreatedAmortizationId = createSelector(
	selectAmortizationState,
	amortizationState => amortizationState.lastCreatedAmortizationId
);

export const selectAmortizationPageLastQuery = createSelector(
	selectAmortizationState,
	amortizationState => amortizationState.lastQuery
);

export const selectAmortizationInStore = createSelector(
	selectAmortizationState,
	amortizationState => {
		const items: AmortizationModel[] = [];
		each(amortizationState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: AmortizationModel[] = httpExtension.sortArray(items, amortizationState.lastQuery.sortField, amortizationState.lastQuery.sortOrder);
		return new QueryResultsModel(result, amortizationState.totalCount, '');
	}
);

export const selectAmortizationShowInitWaitingMessage = createSelector(
	selectAmortizationState,
	amortizationState => amortizationState.showInitWaitingMessage
);

export const selectHasAmortizationInStore = createSelector(
	selectAmortizationState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
