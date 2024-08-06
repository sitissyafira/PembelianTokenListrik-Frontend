// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { PowerRateActions, PowerRateActionTypes } from './rate.action';
// CRUD
import { QueryPowerRateModel } from './queryrate.model';
// Models
import { PowerRateModel } from './rate.model';

// tslint:disable-next-line:no-empty-interface
export interface PowerRateState extends EntityState<PowerRateModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedPowerRateId: string;
	lastQuery: QueryPowerRateModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<PowerRateModel> = createEntityAdapter<PowerRateModel>(
	{ selectId: model => model._id, }
);

export const initialPowerRateState: PowerRateState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryPowerRateModel({}),
	lastCreatedPowerRateId: undefined,
	showInitWaitingMessage: true
});

export function powerrateReducer(state = initialPowerRateState, action: PowerRateActions): PowerRateState {
	switch  (action.type) {
		case PowerRateActionTypes.PowerRatePageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedPowerRateId: undefined
		};
		case PowerRateActionTypes.PowerRateActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case PowerRateActionTypes.PowerRateOnServerCreated: return {
			...state
		};
		case PowerRateActionTypes.PowerRateCreated: return adapter.addOne(action.payload.powerrate, {
			...state, lastCreatedBlockId: action.payload.powerrate._id
		});
		case PowerRateActionTypes.PowerRateUpdated: return adapter.updateOne(action.payload.partialPowerRate, state);
		case PowerRateActionTypes.PowerRateDeleted: return adapter.removeOne(action.payload.id, state);
		case PowerRateActionTypes.PowerRatePageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryPowerRateModel({})
		};
		case PowerRateActionTypes.PowerRatePageLoaded: {
			return adapter.addMany(action.payload.powerrate, {
				...initialPowerRateState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getPowerRateState = createFeatureSelector<PowerRateState>('powerrate');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
