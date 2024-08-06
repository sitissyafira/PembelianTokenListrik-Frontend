// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { GasRateActions, GasRateActionTypes } from './rate.action';
// CRUD
import { QueryGasRateModel } from './queryrate.model';
// Models
import { GasRateModel } from './rate.model';

// tslint:disable-next-line:no-empty-interface
export interface GasRateState extends EntityState<GasRateModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedGasRateId: string;
	lastQuery: QueryGasRateModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<GasRateModel> = createEntityAdapter<GasRateModel>(
	{ selectId: model => model._id, }
);

export const initialGasRateState: GasRateState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryGasRateModel({}),
	lastCreatedGasRateId: undefined,
	showInitWaitingMessage: true
});

export function gasrateReducer(state = initialGasRateState, action: GasRateActions): GasRateState {
	switch  (action.type) {
		case GasRateActionTypes.GasRatePageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedGasRateId: undefined
		};
		case GasRateActionTypes.GasRateActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case GasRateActionTypes.GasRateOnServerCreated: return {
			...state
		};
		case GasRateActionTypes.GasRateCreated: return adapter.addOne(action.payload.gasrate, {
			...state, lastCreatedGasRateId: action.payload.gasrate._id
		});
		case GasRateActionTypes.GasRateUpdated: return adapter.updateOne(action.payload.partialGasRate, state);
		case GasRateActionTypes.GasRateDeleted: return adapter.removeOne(action.payload.id, state);
		case GasRateActionTypes.GasRatePageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryGasRateModel({})
		};
		case GasRateActionTypes.GasRatePageLoaded: {
			return adapter.addMany(action.payload.gasrate, {
				...initialGasRateState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getGasRateState = createFeatureSelector<GasRateState>('gasrate');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
