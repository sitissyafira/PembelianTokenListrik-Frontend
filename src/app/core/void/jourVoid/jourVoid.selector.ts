// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { JourVoidState } from './jourVoid.reducer';
import { each } from 'lodash';
import { JourVoidModel } from './jourVoid.model';


export const selectJourVoidState = createFeatureSelector<JourVoidState>('jourVoid');

export const selectJourVoidById = (jourVoidId: string) => createSelector(
	selectJourVoidState,
	jourVoidState => jourVoidState.entities[jourVoidId]
);

export const selectJourVoidPageLoading = createSelector(
	selectJourVoidState,
	jourVoidState => {
		return jourVoidState.listLoading;
	}
);

export const selectJourVoidActionLoading = createSelector(
	selectJourVoidState,
	jourVoidState => jourVoidState.actionsloading
);

export const selectLastCreatedJourVoidId = createSelector(
	selectJourVoidState,
	jourVoidState => jourVoidState.lastCreatedJourVoidId
);

export const selectJourVoidPageLastQuery = createSelector(
	selectJourVoidState,
	jourVoidState => jourVoidState.lastQuery
);

export const selectJourVoidInStore = createSelector(
	selectJourVoidState,
	jourVoidState => {
		const items: JourVoidModel[] = [];
		each(jourVoidState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: JourVoidModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, jourVoidState.totalCount, '');
	}
);

export const selectJourVoidShowInitWaitingMessage = createSelector(
	selectJourVoidState,
	jourVoidState => jourVoidState.showInitWaitingMessage
);

export const selectHasJourVoidGroupInStore = createSelector(
	selectJourVoidState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
