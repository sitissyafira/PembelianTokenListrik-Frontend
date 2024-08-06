// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { ImportpaymentState } from './importpayment.reducer';
import { each } from 'lodash';
import { ImportpaymentModel } from './importpayment.model';


export const selectImportpaymentState = createFeatureSelector<ImportpaymentState>('importpayment');

export const selectImportpaymentById = (rentalbillingId: string) => createSelector(
	selectImportpaymentState,
	importpaymentState => importpaymentState.entities[rentalbillingId]
);

export const selectImportpaymentPageLoading = createSelector(
	selectImportpaymentState,
	importpaymentState => {
		return importpaymentState.listLoading;
	}
);

export const selectImportpaymentActionLoading = createSelector(
	selectImportpaymentState,
	importpaymentState => importpaymentState.actionsloading
);

export const selectLastCreatedImportpaymentId = createSelector(
	selectImportpaymentState,
	importpaymentState => importpaymentState.lastCreatedImportpaymentId
);

export const selectRentalbillingPageLastQuery = createSelector(
	selectImportpaymentState,
	importpaymentState => importpaymentState.lastQuery
);

export const selectImportpaymentInStore = createSelector(
	selectImportpaymentState,
	importpaymentState => {
		const items: ImportpaymentModel[] = [];
		each(importpaymentState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: ImportpaymentModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, importpaymentState.totalCount, '');
	}
);

export const selectImportpaymentShowInitWaitingMessage = createSelector(
	selectImportpaymentState,
	importpaymentState => importpaymentState.showInitWaitingMessage
);

export const selectHasRentalbillingInStore = createSelector(
	selectImportpaymentState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
