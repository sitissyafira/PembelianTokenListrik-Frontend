
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { PatroliActions, PatroliActionTypes } from './patroli.action';

import { PatroliModel } from './patroli.model';
import { QueryPatroliModel } from './querypatroli.model';

export interface PatroliState extends EntityState<PatroliModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedPatroliId: string;
	lastQuery: QueryPatroliModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<PatroliModel> = createEntityAdapter<PatroliModel>(
	{ selectId: model => model._id, }
);

export const initialPatroliState: PatroliState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryPatroliModel({}),
	lastCreatedPatroliId: undefined,
	showInitWaitingMessage: true
});

export function patroliReducer(state = initialPatroliState, action: PatroliActions): PatroliState {
	switch  (action.type) {
		case PatroliActionTypes.PatroliPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedPatroliId: undefined
		};
		case PatroliActionTypes.PatroliActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case PatroliActionTypes.PatroliOnServerCreated: return {
			...state
		};
		case PatroliActionTypes.PatroliCreated: return adapter.addOne(action.payload.patroli, {
			...state, lastCreatedBlockId: action.payload.patroli._id
		});
		case PatroliActionTypes.PatroliUpdated: return adapter.updateOne(action.payload.partialPatroli, state);
		case PatroliActionTypes.PatroliDeleted: return adapter.removeOne(action.payload.id, state);
		case PatroliActionTypes.PatroliPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryPatroliModel({})
		};
		case PatroliActionTypes.PatroliPageLoaded: {
			return adapter.addMany(action.payload.patroli, {
				...initialPatroliState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getPatroliState = createFeatureSelector<PatroliState>('patroli');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
