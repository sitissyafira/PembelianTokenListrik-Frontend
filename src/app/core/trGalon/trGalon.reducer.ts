import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { TrGalonActions, TrGalonActionTypes } from './trGalon.action';
// CRUD
import { QueryTrGalonModel } from './querytrGalon.model';
// Models
import { TrGalonModel } from './trGalon.model';

export interface TrGalonState extends EntityState<TrGalonModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedTrGalonId: string;
	lastQuery: QueryTrGalonModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<TrGalonModel> = createEntityAdapter<TrGalonModel>(
	{ selectId: model => model._id, }
);

export const initialTrGalonState: TrGalonState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery: new QueryTrGalonModel({}),
	lastCreatedTrGalonId: undefined,
	showInitWaitingMessage: true
});

export function trGalonReducer(state = initialTrGalonState, action: TrGalonActions): TrGalonState {
	switch (action.type) {
		case TrGalonActionTypes.TrGalonPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedTrGalonId: undefined
		};
		case TrGalonActionTypes.TrGalonActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case TrGalonActionTypes.TrGalonOnServerCreated: return {
			...state
		};
		case TrGalonActionTypes.TrGalonCreated: return adapter.addOne(action.payload.trGalon, {
			...state, lastCreatedBlockId: action.payload.trGalon._id
		});
		case TrGalonActionTypes.TrGalonUpdated: return adapter.updateOne(action.payload.partialTrGalon, state);
		case TrGalonActionTypes.TrGalonDeleted: return adapter.removeOne(action.payload.id, state);
		case TrGalonActionTypes.TrGalonPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryTrGalonModel({})
		};
		case TrGalonActionTypes.TrGalonPageLoaded: {
			return adapter.addMany(action.payload.trGalon, {
				...initialTrGalonState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getTrGalonState = createFeatureSelector<TrGalonState>('trGalon');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
