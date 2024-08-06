// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { UomActions, UomActionTypes } from './uom.action';
// CRUD

// Models
import { UomModel } from './uom.model';
import { QueryUomModel } from './queryuom.model';

// tslint:disable-next-line:no-empty-interface
export interface UomState extends EntityState<UomModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedUomId: string;
	lastQuery: QueryUomModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<UomModel> = createEntityAdapter<UomModel>(
	{ selectId: model => model._id, }
);

export const initialUomState: UomState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryUomModel({}),
	lastCreatedUomId: undefined,
	showInitWaitingMessage: true
});

export function uomReducer(state = initialUomState, action: UomActions): UomState {
	switch  (action.type) {
		case UomActionTypes.UomPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedUomId: undefined
		};
		case UomActionTypes.UomActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case UomActionTypes.UomOnServerCreated: return {
			...state
		};
		case UomActionTypes.UomCreated: return adapter.addOne(action.payload.uom, {
			...state, lastCreatedBlockId: action.payload.uom._id
		});
		case UomActionTypes.UomUpdated: return adapter.updateOne(action.payload.partialUom, state);
		case UomActionTypes.UomDeleted: return adapter.removeOne(action.payload.id, state);
		case UomActionTypes.UomPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryUomModel({})
		};
		case UomActionTypes.UomPageLoaded: {
			return adapter.addMany(action.payload.uom, {
				...initialUomState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getUomState = createFeatureSelector<UomState>('uom');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
