// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { UnitActions, UnitActionTypes } from './unit.action';
// CRUD
import { QueryUnitModel } from './queryunit.model';
// Models
import { UnitModel } from './unit.model';

// tslint:disable-next-line:no-empty-interface
export interface UnitState extends EntityState<UnitModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedUnitId: string;
	lastQuery: QueryUnitModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<UnitModel> = createEntityAdapter<UnitModel>(
	{ selectId: model => model._id, }
);

export const initialUnitState: UnitState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryUnitModel({}),
	lastCreatedUnitId: undefined,
	showInitWaitingMessage: true
});

export function unitReducer(state = initialUnitState, action: UnitActions): UnitState {
	switch  (action.type) {
		case UnitActionTypes.UnitPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedUnitId: undefined
		};
		case UnitActionTypes.UnitActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case UnitActionTypes.UnitOnServerCreated: return {
			...state
		};
		case UnitActionTypes.UnitCreated: return adapter.addOne(action.payload.unit, {
			...state, lastCreatedBlockId: action.payload.unit._id
		});
		case UnitActionTypes.UnitUpdated: return adapter.updateOne(action.payload.partialUnit, state);
		case UnitActionTypes.UnitDeleted: return adapter.removeOne(action.payload.id, state);
		case UnitActionTypes.UnitPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryUnitModel({})
		};
		case UnitActionTypes.UnitPageLoaded: {
			return adapter.addMany(action.payload.unit, {
				...initialUnitState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getUnitState = createFeatureSelector<UnitState>('unit');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
