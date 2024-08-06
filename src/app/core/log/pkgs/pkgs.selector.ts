// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { PkgsState } from './pkgs.reducer';
import { each } from 'lodash';
import { PkgsModel } from './pkgs.model';


export const selectPkgsState = createFeatureSelector<PkgsState>('pkgs');

export const selectPkgsById = (pkgsId: string) => createSelector(
	selectPkgsState,
	pkgsState =>  pkgsState.entities[pkgsId]
);

export const selectPkgsPageLoading = createSelector(
	selectPkgsState,
	pkgsState => {
		return pkgsState.listLoading;
	}
);

export const selectPkgsActionLoading = createSelector(
	selectPkgsState,
	pkgsState => pkgsState.actionsloading
);

export const selectLastCreatedPkgsId = createSelector(
	selectPkgsState,
	pkgsState => pkgsState.lastCreatedPkgsId
);

export const selectPkgsPageLastQuery = createSelector(
	selectPkgsState,
	pkgsState => pkgsState.lastQuery
);

export const selectPkgsInStore = createSelector(
	selectPkgsState,
	pkgsState => {
		const items: PkgsModel[] = [];
		each(pkgsState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: PkgsModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, pkgsState.totalCount, '');
	}
);

export const selectPkgsShowInitWaitingMessage = createSelector(
	selectPkgsState,
	pkgsState => pkgsState.showInitWaitingMessage
);

export const selectHasPkgsInStore = createSelector(
	selectPkgsState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
