import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
import { AbsensiState } from './absensi.reducer';
import { each } from 'lodash';
import { AbsensiModel } from './absensi.model';


export const selectAbsensiState = createFeatureSelector<AbsensiState>('absensi');

export const selectAbsensiById = (absensiId: string) => createSelector(
	selectAbsensiState,
	absensiState =>  absensiState.entities[absensiId]
);

export const selectAbsensiPageLoading = createSelector(
	selectAbsensiState,
	absensiState => {
		return absensiState.listLoading;
	}
);

export const selectAbsensiActionLoading = createSelector(
	selectAbsensiState,
	absensiState => absensiState.actionsloading
);

export const selectLastCreatedAbsensiId = createSelector(
	selectAbsensiState,
	absensiState => absensiState.lastCreatedAbsensiId
);

export const selectAbsensiPageLastQuery = createSelector(
	selectAbsensiState,
	absensiState => absensiState.lastQuery
);

export const selectAbsensiInStore = createSelector(
	selectAbsensiState,
	absensiState => {
		const items: AbsensiModel[] = [];
		each(absensiState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: AbsensiModel[] = httpExtension.sortArray(items, absensiState.lastQuery.sortField, absensiState.lastQuery.sortOrder);
		return new QueryResultsModel(result, absensiState.totalCount, '');
	}
);

export const selectAbsensiShowInitWaitingMessage = createSelector(
	selectAbsensiState,
	absensiState => absensiState.showInitWaitingMessage
);

export const selectHasAbsensiInStore = createSelector(
	selectAbsensiState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
