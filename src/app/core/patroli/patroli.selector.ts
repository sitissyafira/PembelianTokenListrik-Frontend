import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
import { PatroliState } from './patroli.reducer';
import { each } from 'lodash';
import { PatroliModel } from './patroli.model';


export const selectPatroliState = createFeatureSelector<PatroliState>('patroli');

export const selectPatroliById = (patroliId: string) => createSelector(
	selectPatroliState,
	patroliState =>  patroliState.entities[patroliId]
);

export const selectPatroliPageLoading = createSelector(
	selectPatroliState,
	patroliState => {
		return patroliState.listLoading;
	}
);

export const selectPatroliActionLoading = createSelector(
	selectPatroliState,
	patroliState => patroliState.actionsloading
);

export const selectLastCreatedPatroliId = createSelector(
	selectPatroliState,
	patroliState => patroliState.lastCreatedPatroliId
);

export const selectPatroliPageLastQuery = createSelector(
	selectPatroliState,
	patroliState => patroliState.lastQuery
);

export const selectPatroliInStore = createSelector(
	selectPatroliState,
	patroliState => {
		const items: PatroliModel[] = [];
		each(patroliState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: PatroliModel[] = httpExtension.sortArray(items, patroliState.lastQuery.sortField, patroliState.lastQuery.sortOrder);
		return new QueryResultsModel(result, patroliState.totalCount, '');
	}
);

export const selectPatroliShowInitWaitingMessage = createSelector(
	selectPatroliState,
	patroliState => patroliState.showInitWaitingMessage
);

export const selectHasPatroliInStore = createSelector(
	selectPatroliState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
