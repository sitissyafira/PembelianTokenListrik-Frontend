// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../../_base/crud';
// State
import { MasterState } from './master.reducer';
import { each } from 'lodash';
import { MasterModel } from './master.model';


export const selectMasterState = createFeatureSelector<MasterState>('master');

export const selectMasterById = (masterId: string) => createSelector(
	selectMasterState,
	masterState => masterState.entities[masterId]
);

export const selectMasterPageLoading = createSelector(
	selectMasterState,
	masterState => {
		return masterState.listLoading;
	}
);

export const selectMasterActionLoading = createSelector(
	selectMasterState,
	masterState => masterState.actionsloading
);

export const selectLastCreatedMasterId = createSelector(
	selectMasterState,
	masterState => masterState.lastCreatedMasterId
);

export const selectMasterPageLastQuery = createSelector(
	selectMasterState,
	masterState => masterState.lastQuery
);

export const selectMasterInStore = createSelector(
	selectMasterState,
	masterState => {
		const items: MasterModel[] = [];
		each(masterState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: MasterModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, masterState.totalCount, '');
	}
);

export const selectMasterShowInitWaitingMessage = createSelector(
	selectMasterState,
	masterState => masterState.showInitWaitingMessage
);

export const selectHasMasterInStore = createSelector(
	selectMasterState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
