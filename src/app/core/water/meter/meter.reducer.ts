// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { WaterMeterActions, WaterMeterActionTypes } from './meter.action';
// CRUD
import { QueryWaterMeterModel } from './querymeter.model';
// Models
import { WaterMeterModel } from './meter.model';

// tslint:disable-next-line:no-empty-interface
export interface WaterMeterState extends EntityState<WaterMeterModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedWaterMeterId: string;
	lastQuery: QueryWaterMeterModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<WaterMeterModel> = createEntityAdapter<WaterMeterModel>(
	{ selectId: model => model._id, }
);

export const initialWaterMeterState: WaterMeterState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryWaterMeterModel({}),
	lastCreatedWaterMeterId: undefined,
	showInitWaitingMessage: true
});

export function watermeterReducer(state = initialWaterMeterState, action: WaterMeterActions): WaterMeterState {
	switch  (action.type) {
		case WaterMeterActionTypes.WaterMeterPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedWaterMeterId: undefined
		};
		case WaterMeterActionTypes.WaterMeterActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case WaterMeterActionTypes.WaterMeterOnServerCreated: return {
			...state
		};
		case WaterMeterActionTypes.WaterMeterCreated: return adapter.addOne(action.payload.watermeter, {
			...state, lastCreatedBlockId: action.payload.watermeter._id
		});
		case WaterMeterActionTypes.WaterMeterUpdated: return adapter.updateOne(action.payload.partialWaterMeter, state);
		case WaterMeterActionTypes.WaterMeterDeleted: return adapter.removeOne(action.payload.id, state);
		case WaterMeterActionTypes.WaterMeterPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryWaterMeterModel({})
		};
		case WaterMeterActionTypes.WaterMeterPageLoaded: {
			return adapter.addMany(action.payload.watermeter, {
				...initialWaterMeterState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getWaterMeterState = createFeatureSelector<WaterMeterState>('watermeter');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
