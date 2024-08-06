import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
import { InspeksiState } from './inspeksi.reducer';
import { each } from 'lodash';
import { InspeksiModel } from './inspeksi.model';


export const selectInspeksiState = createFeatureSelector<InspeksiState>('inspeksi');

export const selectInspeksiById = (inspeksiId: string) => createSelector(
	selectInspeksiState,
	inspeksiState =>  inspeksiState.entities[inspeksiId]
);

export const selectInspeksiPageLoading = createSelector(
	selectInspeksiState,
	inspeksiState => {
		return inspeksiState.listLoading;
	}
);

export const selectInspeksiActionLoading = createSelector(
	selectInspeksiState,
	inspeksiState => inspeksiState.actionsloading
);

export const selectLastCreatedInspeksiId = createSelector(
	selectInspeksiState,
	inspeksiState => inspeksiState.lastCreatedInspeksiId
);

export const selectInspeksiPageLastQuery = createSelector(
	selectInspeksiState,
	inspeksiState => inspeksiState.lastQuery
);

export const selectInspeksiInStore = createSelector(
	selectInspeksiState,
	inspeksiState => {
		const items: InspeksiModel[] = [];
		each(inspeksiState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: InspeksiModel[] = httpExtension.sortArray(items, inspeksiState.lastQuery.sortField, inspeksiState.lastQuery.sortOrder);
		return new QueryResultsModel(result, inspeksiState.totalCount, '');
	}
);

export const selectInspeksiShowInitWaitingMessage = createSelector(
	selectInspeksiState,
	inspeksiState => inspeksiState.showInitWaitingMessage
);

export const selectHasInspeksiInStore = createSelector(
	selectInspeksiState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
