// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { CashbState } from './cashb.reducer';
import { each } from 'lodash';
import { CashbModel } from './cashb.model';


export const selectCashbState = createFeatureSelector<CashbState>('cashb');

export const selectCashbById = (cashbId: string) => createSelector(
	selectCashbState,
	cashbState =>  cashbState.entities[cashbId]
);

export const selectCashbPageLoading = createSelector(
	selectCashbState,
	cashbState => {
		return cashbState.listLoading;
	}
);

export const selectCashbActionLoading = createSelector(
	selectCashbState,
	cashbState => cashbState.actionsloading
);

export const selectLastCreatedCashbId = createSelector(
	selectCashbState,
	cashbState => cashbState.lastCreatedCashbId
);

export const selectCashbPageLastQuery = createSelector(
	selectCashbState,
	cashbState => cashbState.lastQuery
);

export const selectCashbInStore = createSelector(
	selectCashbState,
	cashbState => {
		const items: CashbModel[] = [];
		each(cashbState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: CashbModel[] = httpExtension.sortArray(items, '', 'asc');
		return new QueryResultsModel(result, cashbState.totalCount, '');
	}
);

export const selectCashbShowInitWaitingMessage = createSelector(
	selectCashbState,
	cashbState => cashbState.showInitWaitingMessage
);

export const selectHasCashbInStore = createSelector(
	selectCashbState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
