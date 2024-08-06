// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../../_base/crud';
// State
import { AdjustmentState } from './adjustment.reducer';
import { each } from 'lodash';
import { AdjustmentModel } from './adjustment.model';


export const selectAdjustmentState = createFeatureSelector<AdjustmentState>('adjustment');

export const selectAdjustmentById = (adjustmentId: string) => createSelector(
	selectAdjustmentState,
	adjustmentState => adjustmentState.entities[adjustmentId]
);

export const selectAdjustmentPageLoading = createSelector(
	selectAdjustmentState,
	adjustmentState => {
		return adjustmentState.listLoading;
	}
);

export const selectAdjustmentActionLoading = createSelector(
	selectAdjustmentState,
	adjustmentState => adjustmentState.actionsloading
);

export const selectLastCreatedAdjustmentId = createSelector(
	selectAdjustmentState,
	adjustmentState => adjustmentState.lastCreatedAdjustmentId
);

export const selectAdjustmentPageLastQuery = createSelector(
	selectAdjustmentState,
	adjustmentState => adjustmentState.lastQuery
);

export const selectAdjustmentInStore = createSelector(
	selectAdjustmentState,
	adjustmentState => {
		const items: AdjustmentModel[] = [];
		each(adjustmentState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: AdjustmentModel[] = httpExtension.sortArray(items, adjustmentState.lastQuery.sortField, adjustmentState.lastQuery.sortOrder);
		return new QueryResultsModel(result, adjustmentState.totalCount, '');
	}
);

export const selectAdjustmentShowInitWaitingMessage = createSelector(
	selectAdjustmentState,
	adjustmentState => adjustmentState.showInitWaitingMessage
);

export const selectHasAdjustmentInStore = createSelector(
	selectAdjustmentState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
