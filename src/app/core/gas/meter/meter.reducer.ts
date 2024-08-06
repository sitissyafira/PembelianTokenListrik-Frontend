// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { GasMeterActions, GasMeterActionTypes } from './meter.action';
// CRUD
import { QueryGasMeterModel } from './querymeter.model';
// Models
import { GasMeterModel } from './meter.model';

// tslint:disable-next-line:no-empty-interface
export interface GasMeterState extends EntityState<GasMeterModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedGasMeterId: string;
	lastQuery: QueryGasMeterModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<GasMeterModel> = createEntityAdapter<GasMeterModel>(
	{ selectId: model => model._id, }
);

export const initialGasMeterState: GasMeterState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryGasMeterModel({}),
	lastCreatedGasMeterId: undefined,
	showInitWaitingMessage: true
});

export function gasmeterReducer(state = initialGasMeterState, action: GasMeterActions): GasMeterState {
	switch  (action.type) {
		case GasMeterActionTypes.GasMeterPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedGasMeterId: undefined
		};
		case GasMeterActionTypes.GasMeterActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case GasMeterActionTypes.GasMeterOnServerCreated: return {
			...state
		};
		case GasMeterActionTypes.GasMeterCreated: return adapter.addOne(action.payload.gasmeter, {
			...state, lastCreatedBlockId: action.payload.gasmeter._id
		});
		case GasMeterActionTypes.GasMeterUpdated: return adapter.updateOne(action.payload.partialGasMeter, state);
		case GasMeterActionTypes.GasMeterDeleted: return adapter.removeOne(action.payload.id, state);
		case GasMeterActionTypes.GasMeterPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryGasMeterModel({})
		};
		case GasMeterActionTypes.GasMeterPageLoaded: {
			return adapter.addMany(action.payload.gasmeter, {
				...initialGasMeterState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getGasMeterState = createFeatureSelector<GasMeterState>('gasmeter');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
