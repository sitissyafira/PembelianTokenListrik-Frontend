// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { RatePinaltyActions, RatePinaltyActionTypes } from './ratePinalty.action';
// CRUD

// Models
import { RatePinaltyModel } from './ratePinalty.model';
import { QueryPinaltyModel } from './querypinalty.model';

// tslint:disable-next-line:no-empty-interface
export interface RatePinaltyState extends EntityState<RatePinaltyModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedRatePinaltyId: string;
	lastQuery: QueryPinaltyModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<RatePinaltyModel> = createEntityAdapter<RatePinaltyModel>(
	{ selectId: model => model._id, }
);

export const initialRatePinaltyState: RatePinaltyState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryPinaltyModel({}),
	lastCreatedRatePinaltyId: undefined,
	showInitWaitingMessage: true
});

export function ratePinaltyReducer(state = initialRatePinaltyState, action: RatePinaltyActions): RatePinaltyState {
	switch  (action.type) {
		case RatePinaltyActionTypes.RatePinaltyPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedRatePinaltyId: undefined
		};
		case RatePinaltyActionTypes.RatePinaltyActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case RatePinaltyActionTypes.RatePinaltyOnServerCreated: return {
			...state
		};
		case RatePinaltyActionTypes.RatePinaltyCreated: return adapter.addOne(action.payload.ratePinalty, {
			...state, lastCreatedBlockId: action.payload.ratePinalty._id
		});
		case RatePinaltyActionTypes.RatePinaltyUpdated: return adapter.updateOne(action.payload.partialRatePinalty, state);
		case RatePinaltyActionTypes.RatePinaltyDeleted: return adapter.removeOne(action.payload.id, state);
		case RatePinaltyActionTypes.RatePinaltyPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryPinaltyModel({})
		};
		case RatePinaltyActionTypes.RatePinaltyPageLoaded: {
			return adapter.addMany(action.payload.ratePinalty, {
				...initialRatePinaltyState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getRatePinaltyState = createFeatureSelector<RatePinaltyState>('ratePinalty');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
