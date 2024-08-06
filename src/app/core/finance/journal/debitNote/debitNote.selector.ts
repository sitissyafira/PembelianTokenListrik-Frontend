// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../../_base/crud';
// State
import { DebitNoteState } from './debitNote.reducer';
import { each } from 'lodash';
import { DebitNoteModel } from './debitNote.model';


export const selectDebitNoteState = createFeatureSelector<DebitNoteState>('debitNote');

export const selectDebitNoteById = (debitNoteId: string) => createSelector(
	selectDebitNoteState,
	debitNoteState => debitNoteState.entities[debitNoteId]
);

export const selectDebitNotePageLoading = createSelector(
	selectDebitNoteState,
	debitNoteState => {
		return debitNoteState.listLoading;
	}
);

export const selectDebitNoteActionLoading = createSelector(
	selectDebitNoteState,
	debitNoteState => debitNoteState.actionsloading
);

export const selectLastCreatedDebitNoteId = createSelector(
	selectDebitNoteState,
	debitNoteState => debitNoteState.lastCreatedDebitNoteId
);

export const selectDebitNotePageLastQuery = createSelector(
	selectDebitNoteState,
	debitNoteState => debitNoteState.lastQuery
);

export const selectDebitNoteInStore = createSelector(
	selectDebitNoteState,
	debitNoteState => {
		const items: DebitNoteModel[] = [];
		each(debitNoteState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: DebitNoteModel[] = httpExtension.sortArray(items, debitNoteState.lastQuery.sortField, debitNoteState.lastQuery.sortOrder);
		return new QueryResultsModel(result, debitNoteState.totalCount, '');
	}
);

export const selectDebitNoteShowInitWaitingMessage = createSelector(
	selectDebitNoteState,
	debitNoteState => debitNoteState.showInitWaitingMessage
);

export const selectHasDebitNoteInStore = createSelector(
	selectDebitNoteState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
