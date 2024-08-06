import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
import { ShiftState } from './shift.reducer';
import { each } from 'lodash';
import { ShiftModel } from './shift.model';


export const selectShiftState = createFeatureSelector<ShiftState>('shift');

export const selectShiftById = (shiftId: string) => createSelector(
	selectShiftState,
	shiftState =>  shiftState.entities[shiftId]
);

export const selectShiftPageLoading = createSelector(
	selectShiftState,
	shiftState => {
		return shiftState.listLoading;
	}
);

export const selectShiftActionLoading = createSelector(
	selectShiftState,
	shiftState => shiftState.actionsloading
);

export const selectLastCreatedShiftId = createSelector(
	selectShiftState,
	shiftState => shiftState.lastCreatedShiftId
);

export const selectShiftPageLastQuery = createSelector(
	selectShiftState,
	shiftState => shiftState.lastQuery
);

export const selectShiftInStore = createSelector(
	selectShiftState,
	shiftState => {
		const items: ShiftModel[] = [];
		each(shiftState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: ShiftModel[] = httpExtension.sortArray(items, shiftState.lastQuery.sortField, shiftState.lastQuery.sortOrder);
		return new QueryResultsModel(result, shiftState.totalCount, '');
	}
);

export const selectShiftShowInitWaitingMessage = createSelector(
	selectShiftState,
	shiftState => shiftState.showInitWaitingMessage
);

export const selectHasShiftInStore = createSelector(
	selectShiftState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
