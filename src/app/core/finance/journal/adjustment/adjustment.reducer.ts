// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { AdjustmentActions, AdjustmentActionTypes } from './adjustment.action';
// CRUD

// Models
import { AdjustmentModel } from './adjustment.model';
import { QueryAdjustmentModel } from './queryadjustment.model';

// tslint:disable-next-line:no-empty-interface
export interface AdjustmentState extends EntityState<AdjustmentModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedAdjustmentId: string;
	lastQuery: QueryAdjustmentModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<AdjustmentModel> = createEntityAdapter<AdjustmentModel>(
	{ selectId: model => model._id, }
);

export const initialAdjustmentState: AdjustmentState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery: new QueryAdjustmentModel({}),
	lastCreatedAdjustmentId: undefined,
	showInitWaitingMessage: true
});

export function adjustmentReducer(state = initialAdjustmentState, action: AdjustmentActions): AdjustmentState {
	switch (action.type) {
		case AdjustmentActionTypes.AdjustmentPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedAdjustmentId: undefined
		};
		case AdjustmentActionTypes.AdjustmentActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case AdjustmentActionTypes.AdjustmentOnServerCreated: return {
			...state
		};
		case AdjustmentActionTypes.AdjustmentCreated: return adapter.addOne(action.payload.adjustment, {
			...state, lastCreatedBlockId: action.payload.adjustment._id
		});
		case AdjustmentActionTypes.AdjustmentUpdated: return adapter.updateOne(action.payload.padjustmenttialAdjustment, state);
		case AdjustmentActionTypes.AdjustmentDeleted: return adapter.removeOne(action.payload.id, state);
		case AdjustmentActionTypes.AdjustmentPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryAdjustmentModel({})
		};
		case AdjustmentActionTypes.AdjustmentPageLoaded: {
			return adapter.addMany(action.payload.adjustment, {
				...initialAdjustmentState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getAdjustmentState = createFeatureSelector<AdjustmentState>('adjustment');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
