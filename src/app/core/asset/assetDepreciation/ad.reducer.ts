// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { AdActions, AdActionTypes } from './ad.action';
// CRUD

// Models
import { AdModel } from './ad.model';
import { QueryAdModel } from './queryad.model';

// tslint:disable-next-line:no-empty-interface
export interface AdState extends EntityState<AdModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedAdId: string;
	lastQuery: QueryAdModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<AdModel> = createEntityAdapter<AdModel>(
	{ selectId: model => model._id, }
);

export const initialAdState: AdState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryAdModel({}),
	lastCreatedAdId: undefined,
	showInitWaitingMessage: true
});

export function adReducer(state = initialAdState, action: AdActions): AdState {
	switch  (action.type) {
		case AdActionTypes.AdPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedAdId: undefined
		};
		case AdActionTypes.AdActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case AdActionTypes.AdOnServerCreated: return {
			...state
		};
		case AdActionTypes.AdCreated: return adapter.addOne(action.payload.ad, {
			...state, lastCreatedBlockId: action.payload.ad._id
		});
		case AdActionTypes.AdUpdated: return adapter.updateOne(action.payload.partialAd, state);
		case AdActionTypes.AdDeleted: return adapter.removeOne(action.payload.id, state);
		case AdActionTypes.AdPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryAdModel({})
		};
		case AdActionTypes.AdPageLoaded: {
			return adapter.addMany(action.payload.ad, {
				...initialAdState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getAdState = createFeatureSelector<AdState>('a');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
