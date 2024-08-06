// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { BlockState } from './block.reducer';
import { each } from 'lodash';
import { BlockModel } from './block.model';


export const selectBlockState = createFeatureSelector<BlockState>('block');

export const selectBlockById = (blockId: string) => createSelector(
	selectBlockState,
	blockState =>  blockState.entities[blockId]
);

export const selectBlockPageLoading = createSelector(
	selectBlockState,
	blockState => {
		return blockState.listLoading;
	}
);

export const selectBlockActionLoading = createSelector(
	selectBlockState,
	blockState => blockState.actionsloading
);

export const selectLastCreatedBlockId = createSelector(
	selectBlockState,
	blockState => blockState.lastCreatedBlockId
);

export const selectBlockPageLastQuery = createSelector(
	selectBlockState,
	blockState => blockState.lastQuery
);

export const selectBlockInStore = createSelector(
	selectBlockState,
	blockState => {
		const items: BlockModel[] = [];
		each(blockState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: BlockModel[] = httpExtension.sortArray(items, blockState.lastQuery.sortField, blockState.lastQuery.sortOrder);
		return new QueryResultsModel(result, blockState.totalCount, '');
	}
);

export const selectBlockShowInitWaitingMessage = createSelector(
	selectBlockState,
	blockState => blockState.showInitWaitingMessage
);

export const selectHasBlockGroupInStore = createSelector(
	selectBlockState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
