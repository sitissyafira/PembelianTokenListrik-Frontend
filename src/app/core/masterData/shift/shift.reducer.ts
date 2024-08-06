
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { ShiftActions, ShiftActionTypes } from './shift';

import { ShiftModel } from './shift.model';
import { QueryShiftModel } from './queryshift.model';

export interface ShiftState extends EntityState<ShiftModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedShiftId: string;
	lastQuery: QueryShiftModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<ShiftModel> = createEntityAdapter<ShiftModel>(
	{ selectId: model => model._id, }
);

export const initialShiftState: ShiftState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryShiftModel({}),
	lastCreatedShiftId: undefined,
	showInitWaitingMessage: true
});

export function shiftReducer(state = initialShiftState, action: ShiftActions): ShiftState {
	switch  (action.type) {
		case ShiftActionTypes.ShiftPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedShiftId: undefined
		};
		case ShiftActionTypes.ShiftActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case ShiftActionTypes.ShiftOnServerCreated: return {
			...state
		};
		case ShiftActionTypes.ShiftCreated: return adapter.addOne(action.payload.shift, {
			...state, lastCreatedBlockId: action.payload.shift._id
		});
		case ShiftActionTypes.ShiftUpdated: return adapter.updateOne(action.payload.partialShift, state);
		case ShiftActionTypes.ShiftDeleted: return adapter.removeOne(action.payload.id, state);
		case ShiftActionTypes.ShiftPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryShiftModel({})
		};
		case ShiftActionTypes.ShiftPageLoaded: {
			return adapter.addMany(action.payload.shift, {
				...initialShiftState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getShiftState = createFeatureSelector<ShiftState>('shift');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
