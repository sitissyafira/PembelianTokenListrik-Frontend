// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { PinaltyActions, PinaltyActionTypes } from './pinalty.action';
// CRUD
import { QueryParamsModel } from '../_base/crud/models/query-models/query-params.model';
// Models
import { PinaltyModel } from './pinalty.model';

// tslint:disable-next-line:no-empty-interface
export interface PinaltyState extends EntityState<PinaltyModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedPinaltyId: string;
	lastQuery: QueryParamsModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<PinaltyModel> = createEntityAdapter<PinaltyModel>(
	{ selectId: model => model._id, }
);

export const initialPinaltyState: PinaltyState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryParamsModel({}),
	lastCreatedPinaltyId: undefined,
	showInitWaitingMessage: true
});

export function pinaltyReducer(state = initialPinaltyState, action: PinaltyActions): PinaltyState {
	switch  (action.type) {
		case PinaltyActionTypes.PinaltyPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedPinaltyId: undefined
		};
		case PinaltyActionTypes.PinaltyActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case PinaltyActionTypes.PinaltyOnServerCreated: return {
			...state
		};
		case PinaltyActionTypes.PinaltyCreated: return adapter.addOne(action.payload.pinalty, {
			...state, lastCreatedBlockId: action.payload.pinalty._id
		});
		case PinaltyActionTypes.PinaltyUpdated: return adapter.updateOne(action.payload.partialPinalty, state);
		case PinaltyActionTypes.PinaltyDeleted: return adapter.removeOne(action.payload.id, state);
		case PinaltyActionTypes.PinaltyPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryParamsModel({})
		};
		case PinaltyActionTypes.PinaltyPageLoaded: {
			return adapter.addMany(action.payload.pinalty, {
				...initialPinaltyState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getPinaltyState = createFeatureSelector<PinaltyState>('pinalty');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
