// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { BlockGroupState } from './blockgroup.reducer';
import { each } from 'lodash';
import { BlockgroupModel } from './blockgroup.model';


export const selectBlockGroupState = createFeatureSelector<BlockGroupState>('blockgroup');

export const selectBlockGroupById = (blockGroupId: string) => createSelector(
	selectBlockGroupState,
	blockGroupState =>  blockGroupState.entities[blockGroupId]
);

export const selectBlockGroupPageLoading = createSelector(
	selectBlockGroupState,
	blockGroupState => {
		return blockGroupState.listLoading;
	}
);

export const selectBlockGroupActionLoading = createSelector(
	selectBlockGroupState,
	blockGroupState => blockGroupState.actionsloading
);

export const selectLastCreatedBlockGroupId = createSelector(
	selectBlockGroupState,
	blockGroupState => blockGroupState.lastCreatedBlockGroupId
);

export const selectBlockGroupPageLastQuery = createSelector(
	selectBlockGroupState,
	blockGroupState => blockGroupState.lastQuery
);

export const selectBlockGroupInStore = createSelector(
	selectBlockGroupState,
	blockGroupState => {
		const items: BlockgroupModel[] = [];
		each(blockGroupState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: BlockgroupModel[] = httpExtension.sortArray(items, blockGroupState.lastQuery.sortField, blockGroupState.lastQuery.sortOrder);
		return new QueryResultsModel(result, blockGroupState.totalCount, '');
	}
);

export const selectBlockGroupShowInitWaitingMessage = createSelector(
	selectBlockGroupState,
	blockGroupState => blockGroupState.showInitWaitingMessage
);

export const selectHasBlockGroupInStore = createSelector(
	selectBlockGroupState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
