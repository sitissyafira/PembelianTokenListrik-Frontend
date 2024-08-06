// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../../_base/crud';
// State
import { FiscalState } from './fiscal.reducer';
import { each } from 'lodash';
import { FiscalModel } from './fiscal.model';


export const selectFiscalState = createFeatureSelector<FiscalState>('fiscal');

export const selectFiscalById = (fiscalId: string) => createSelector(
	selectFiscalState,
	fiscalState =>  fiscalState.entities[fiscalId]
);

export const selectFiscalPageLoading = createSelector(
	selectFiscalState,
	fiscalState => {
		return fiscalState.listLoading;
	}
);

export const selectFiscalActionLoading = createSelector(
	selectFiscalState,
	fiscalState => fiscalState.actionsloading
);

export const selectLastCreatedFiscalId = createSelector(
	selectFiscalState,
	fiscalState => fiscalState.lastCreatedFiscalId
);

export const selectFiscalPageLastQuery = createSelector(
	selectFiscalState,
	fiscalState => fiscalState.lastQuery
);

export const selectFiscalInStore = createSelector(
	selectFiscalState,
	fiscalState => {
		const items: FiscalModel[] = [];
		each(fiscalState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: FiscalModel[] = httpExtension.sortArray(items, fiscalState.lastQuery.sortField, fiscalState.lastQuery.sortOrder);
		return new QueryResultsModel(result, fiscalState.totalCount, '');
	}
);

export const selectFiscalShowInitWaitingMessage = createSelector(
	selectFiscalState,
	fiscalState => fiscalState.showInitWaitingMessage
);

export const selectHasFiscalInStore = createSelector(
	selectFiscalState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
