// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../../_base/crud';
// State
import { WriteOffState } from './writeOff.reducer';
import { each } from 'lodash';
import { WriteOffModel } from './writeOff.model';


export const selectWriteOffState = createFeatureSelector<WriteOffState>('writeOff');

export const selectWriteOffById = (writeOffId: string) => createSelector(
	selectWriteOffState,
	writeOffState => writeOffState.entities[writeOffId]
);

export const selectWriteOffPageLoading = createSelector(
	selectWriteOffState,
	writeOffState => {
		return writeOffState.listLoading;
	}
);

export const selectWriteOffActionLoading = createSelector(
	selectWriteOffState,
	writeOffState => writeOffState.actionsloading
);

export const selectLastCreatedWriteOffId = createSelector(
	selectWriteOffState,
	writeOffState => writeOffState.lastCreatedWriteOffId
);

export const selectWriteOffPageLastQuery = createSelector(
	selectWriteOffState,
	writeOffState => writeOffState.lastQuery
);

export const selectWriteOffInStore = createSelector(
	selectWriteOffState,
	writeOffState => {
		const items: WriteOffModel[] = [];
		each(writeOffState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: WriteOffModel[] = httpExtension.sortArray(items, writeOffState.lastQuery.sortField, writeOffState.lastQuery.sortOrder);
		return new QueryResultsModel(result, writeOffState.totalCount, '');
	}
);

export const selectWriteOffShowInitWaitingMessage = createSelector(
	selectWriteOffState,
	writeOffState => writeOffState.showInitWaitingMessage
);

export const selectHasWriteOffInStore = createSelector(
	selectWriteOffState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
