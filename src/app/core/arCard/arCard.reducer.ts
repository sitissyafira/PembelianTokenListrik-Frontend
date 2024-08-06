// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { ArCardActions, ArCardActionTypes } from './arCard.action';
// CRUD
import { QueryArCardModel } from './queryarCard.model';
// Models
import { ArCardModel } from './arCard.model';

// tslint:disable-next-line:no-empty-interface
export interface ArCardState extends EntityState<ArCardModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedArCardId: string;
	lastQuery: QueryArCardModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<ArCardModel> = createEntityAdapter<ArCardModel>(
	{ selectId: model => model._id, }
);

export const initialArCardState: ArCardState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery: new QueryArCardModel({}),
	lastCreatedArCardId: undefined,
	showInitWaitingMessage: true
});

export function arCardReducer(state = initialArCardState, action: ArCardActions): ArCardState {
	switch (action.type) {
		case ArCardActionTypes.ArCardPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedArCardId: undefined
		};
		case ArCardActionTypes.ArCardActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case ArCardActionTypes.ArCardOnServerCreated: return {
			...state
		};
		case ArCardActionTypes.ArCardCreated: return adapter.addOne(action.payload.arCard, {
			...state, lastCreatedArCardId: action.payload.arCard._id
		});
		case ArCardActionTypes.ArCardUpdated: return adapter.updateOne(action.payload.partialArCard, state);
		case ArCardActionTypes.ArCardDeleted: return adapter.removeOne(action.payload.id, state);
		case ArCardActionTypes.ArCardPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryArCardModel({})
		};
		case ArCardActionTypes.ArCardPageLoaded: {
			return adapter.addMany(action.payload.arCard, {
				...initialArCardState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getArCardState = createFeatureSelector<ArCardState>('arCard');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
