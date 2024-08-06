// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { PackagesState } from './packages.reducer';
import { each } from 'lodash';
import { PackagesModel } from './packages.model';


export const selectPackagesState = createFeatureSelector<PackagesState>('packages');

export const selectPackagesById = (packagesId: string) => createSelector(
	selectPackagesState,
	packagesState =>  packagesState.entities[packagesId]
);

export const selectPackagesPageLoading = createSelector(
	selectPackagesState,
	packagesState => {
		return packagesState.listLoading;
	}
);

export const selectPackagesActionLoading = createSelector(
	selectPackagesState,
	packagesState => packagesState.actionsloading
);

export const selectLastCreatedPackagesId = createSelector(
	selectPackagesState,
	packagesState => packagesState.lastCreatedPackagesId
);

export const selectPackagesPageLastQuery = createSelector(
	selectPackagesState,
	packagesState => packagesState.lastQuery
);

export const selectPackagesInStore = createSelector(
	selectPackagesState,
	packagesState => {
		const items: PackagesModel[] = [];
		each(packagesState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: PackagesModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, packagesState.totalCount, '');
	}
);

export const selectPackagesShowInitWaitingMessage = createSelector(
	selectPackagesState,
	packagesState => packagesState.showInitWaitingMessage
);

export const selectHasPackagesInStore = createSelector(
	selectPackagesState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
