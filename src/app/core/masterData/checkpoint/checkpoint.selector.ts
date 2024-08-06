import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
import { CheckpointState } from './checkpoint.reducer';
import { each } from 'lodash';
import { CheckpointModel } from './checkpoint.model';


export const selectCheckpointState = createFeatureSelector<CheckpointState>('checkpoint');

export const selectCheckpointById = (checkpointId: string) => createSelector(
	selectCheckpointState,
	checkpointState =>  checkpointState.entities[checkpointId]
);
export const selectCheckpointPageLoading = createSelector(
	selectCheckpointState,
	checkpointState => {
		return checkpointState.listLoading;
	}
);
export const selectCheckpointActionLoading = createSelector(
	selectCheckpointState,
	checkpointState => checkpointState.actionsloading
);
export const selectLastCreatedCheckpointId = createSelector(
	selectCheckpointState,
	checkpointState => checkpointState.lastCreatedCheckpointId
);
export const selectCheckpointPageLastQuery = createSelector(
	selectCheckpointState,
	checkpointState => checkpointState.lastQuery
);
export const selectCheckpointInStore = createSelector(
	selectCheckpointState,
	checkpointState => {
		const items: CheckpointModel[] = [];
		each(checkpointState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: CheckpointModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, checkpointState.totalCount, '');
	}
);
export const selectCheckpointShowInitWaitingMessage = createSelector(
	selectCheckpointState,
	checkpointState => checkpointState.showInitWaitingMessage
);
export const selectHasCheckpointInStore = createSelector(
	selectCheckpointState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
