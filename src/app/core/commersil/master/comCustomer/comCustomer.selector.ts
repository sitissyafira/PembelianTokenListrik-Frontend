import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../../_base/crud';
import { ComCustomerState } from './comCustomer.reducer';
import { each } from 'lodash';
import { ComCustomerModel } from './comCustomer.model';


export const selectComCustomerState = createFeatureSelector<ComCustomerState>('comCustomer');

export const selectComCustomerById = (comCustomerId: string) => createSelector(
	selectComCustomerState,
	comCustomerState =>  comCustomerState.entities[comCustomerId]
);
export const selectComCustomerPageLoading = createSelector(
	selectComCustomerState,
	comCustomerState => {
		return comCustomerState.listLoading;
	}
);
export const selectComCustomerActionLoading = createSelector(
	selectComCustomerState,
	comCustomerState => comCustomerState.actionsloading
);
export const selectLastCreatedComCustomerId = createSelector(
	selectComCustomerState,
	comCustomerState => comCustomerState.lastCreatedComCustomerId
);
export const selectComCustomerPageLastQuery = createSelector(
	selectComCustomerState,
	comCustomerState => comCustomerState.lastQuery
);
export const selectComCustomerInStore = createSelector(
	selectComCustomerState,
	comCustomerState => {
		const items: ComCustomerModel[] = [];
		each(comCustomerState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: ComCustomerModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, comCustomerState.totalCount, '');
	}
);
export const selectComCustomerShowInitWaitingMessage = createSelector(
	selectComCustomerState,
	comCustomerState => comCustomerState.showInitWaitingMessage
);
export const selectHasComCustomerInStore = createSelector(
	selectComCustomerState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
