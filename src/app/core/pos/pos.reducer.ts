// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { PosActions, PosActionTypes } from './pos.action';
// CRUD

// Models
import { PosModel } from './pos.model';
import { QueryPosModel } from './querypos.model';

// tslint:disable-next-line:no-empty-interface
export interface PosState extends EntityState<PosModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedPosId: string;
	lastQuery: QueryPosModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<PosModel> = createEntityAdapter<PosModel>(
	{ selectId: model => model._id, }
);

export const initialPosState: PosState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery: new QueryPosModel({}),
	lastCreatedPosId: undefined,
	showInitWaitingMessage: true
});

export function posReducer(state = initialPosState, action: PosActions): PosState {
	switch (action.type) {
		case PosActionTypes.PosPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedPosId: undefined
		};
		case PosActionTypes.PosActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case PosActionTypes.PosOnServerCreated: return {
			...state
		};
		case PosActionTypes.PosCreated: return adapter.addOne(action.payload.pos, {
			...state, lastCreatedBlockId: action.payload.pos._id
		});
		case PosActionTypes.PosUpdated: return adapter.updateOne(action.payload.partialPos, state);
		case PosActionTypes.PosDeleted: return adapter.removeOne(action.payload.id, state);
		case PosActionTypes.PosPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryPosModel({})
		};
		case PosActionTypes.PosPageLoaded: {
			return adapter.addMany(action.payload.pos, {
				...initialPosState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getPosState = createFeatureSelector<PosState>('pos');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
