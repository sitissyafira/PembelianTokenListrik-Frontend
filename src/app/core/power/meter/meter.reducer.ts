// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { PowerMeterActions, PowerMeterActionTypes } from './meter.action';
// CRUD
import { QueryPowerMeterModel } from './querymeter.model';
// Models
import { PowerMeterModel } from './meter.model';

// tslint:disable-next-line:no-empty-interface
export interface PowerMeterState extends EntityState<PowerMeterModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedPowerMeterId: string;
	lastQuery: QueryPowerMeterModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<PowerMeterModel> = createEntityAdapter<PowerMeterModel>(
	{ selectId: model => model._id, }
);

export const initialPowerMeterState: PowerMeterState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryPowerMeterModel({}),
	lastCreatedPowerMeterId: undefined,
	showInitWaitingMessage: true
});

export function powermeterReducer(state = initialPowerMeterState, action: PowerMeterActions): PowerMeterState {
	switch  (action.type) {
		case PowerMeterActionTypes.PowerMeterPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedPowerMeterId: undefined
		};
		case PowerMeterActionTypes.PowerMeterActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case PowerMeterActionTypes.PowerMeterOnServerCreated: return {
			...state
		};
		case PowerMeterActionTypes.PowerMeterCreated: return adapter.addOne(action.payload.powermeter, {
			...state, lastCreatedBlockId: action.payload.powermeter._id
		});
		case PowerMeterActionTypes.PowerMeterUpdated: return adapter.updateOne(action.payload.partialPowerMeter, state);
		case PowerMeterActionTypes.PowerMeterDeleted: return adapter.removeOne(action.payload.id, state);
		case PowerMeterActionTypes.PowerMeterPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryPowerMeterModel({})
		};
		case PowerMeterActionTypes.PowerMeterPageLoaded: {
			return adapter.addMany(action.payload.powermeter, {
				...initialPowerMeterState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getPowerMeterState = createFeatureSelector<PowerMeterState>('powermeter');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
