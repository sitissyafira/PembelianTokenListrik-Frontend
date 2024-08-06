// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { PowerPrabayarActions, PowerPrabayarActionTypes } from './prabayar.action';
// CRUD
import { QueryPowerPrabayarModel } from './queryprabayar.model';
// Models
import { PowerPrabayarModel } from './prabayar.model';

// tslint:disable-next-line:no-empty-interface
export interface PowerPrabayarState extends EntityState<PowerPrabayarModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedPowerPrabayarId: string;
	lastQuery: QueryPowerPrabayarModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<PowerPrabayarModel> = createEntityAdapter<PowerPrabayarModel>(
	{ selectId: model => model._id, }
);

export const initialPowerPrabayarState: PowerPrabayarState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryPowerPrabayarModel({}),
	lastCreatedPowerPrabayarId: undefined,
	showInitWaitingMessage: true
});

export function powerprabayarReducer(state = initialPowerPrabayarState, action: PowerPrabayarActions): PowerPrabayarState {
	switch  (action.type) {
		case PowerPrabayarActionTypes.PowerPrabayarPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedPowerPrabayarId: undefined
		};
		case PowerPrabayarActionTypes.PowerPrabayarActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case PowerPrabayarActionTypes.PowerPrabayarOnServerCreated: return {
			...state
		};
		case PowerPrabayarActionTypes.PowerPrabayarCreated: return adapter.addOne(action.payload.powerprabayar, {
			...state, lastCreatedBlockId: action.payload.powerprabayar._id
		});
		case PowerPrabayarActionTypes.PowerPrabayarUpdated: return adapter.updateOne(action.payload.partialPowerPrabayar, state);
		case PowerPrabayarActionTypes.PowerPrabayarDeleted: return adapter.removeOne(action.payload.id, state);
		case PowerPrabayarActionTypes.PowerPrabayarPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryPowerPrabayarModel({})
		};
		case PowerPrabayarActionTypes.PowerPrabayarPageLoaded: {
			return adapter.addMany(action.payload.powerprabayar, {
				...initialPowerPrabayarState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getPowerPrabayarState = createFeatureSelector<PowerPrabayarState>('powerprabayar');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
