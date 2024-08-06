// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { GalonRateActions, GalonRateActionTypes } from './rate.action';
// CRUD
import { QueryGalonRateModel } from './queryrate.model';
// Models
import { GalonRateModel } from './rate.model';

// tslint:disable-next-line:no-empty-interface
export interface GalonRateState extends EntityState<GalonRateModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedGalonRateId: string;
	lastQuery: QueryGalonRateModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<GalonRateModel> = createEntityAdapter<GalonRateModel>(
	{ selectId: model => model._id, }
);

export const initialGalonRateState: GalonRateState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery: new QueryGalonRateModel({}),
	lastCreatedGalonRateId: undefined,
	showInitWaitingMessage: true
});

export function galonrateReducer(state = initialGalonRateState, action: GalonRateActions): GalonRateState {
	switch (action.type) {
		case GalonRateActionTypes.GalonRatePageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedGalonRateId: undefined
		};
		case GalonRateActionTypes.GalonRateActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case GalonRateActionTypes.GalonRateOnServerCreated: return {
			...state
		};
		case GalonRateActionTypes.GalonRateCreated: return adapter.addOne(action.payload.galonrate, {
			...state, lastCreatedBlockId: action.payload.galonrate._id
		});
		case GalonRateActionTypes.GalonRateUpdated: return adapter.updateOne(action.payload.partialGalonRate, state);
		case GalonRateActionTypes.GalonRateDeleted: return adapter.removeOne(action.payload.id, state);
		case GalonRateActionTypes.GalonRatePageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryGalonRateModel({})
		};
		case GalonRateActionTypes.GalonRatePageLoaded: {
			return adapter.addMany(action.payload.galonrate, {
				...initialGalonRateState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getGalonRateState = createFeatureSelector<GalonRateState>('galonrate');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
