
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { DivisionActions, DivisionActionTypes } from './division.action';
import { DivisionModel } from './division.model';
import { QueryDivisionModel } from './querydivision.model';

export interface DivisionState extends EntityState<DivisionModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedDivisionId: string;
	lastQuery: QueryDivisionModel;
	showInitWaitingMessage: boolean;
}
export const adapter: EntityAdapter<DivisionModel> = createEntityAdapter<DivisionModel>(
	{ selectId: model => model._id, }
);
export const initialDivisionState: DivisionState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryDivisionModel({}),
	lastCreatedDivisionId: undefined,
	showInitWaitingMessage: true
});
export function divisionReducer(state = initialDivisionState, action: DivisionActions): DivisionState {
	switch  (action.type) {
		case DivisionActionTypes.DivisionPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedDivisionId: undefined
		};
		case DivisionActionTypes.DivisionActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case DivisionActionTypes.DivisionOnServerCreated: return {
			...state
		};
		case DivisionActionTypes.DivisionCreated: return adapter.addOne(action.payload.division, {
			...state, lastCreatedBlockId: action.payload.division._id
		});
		case DivisionActionTypes.DivisionUpdated: return adapter.updateOne(action.payload.partialDivision, state);
		case DivisionActionTypes.DivisionDeleted: return adapter.removeOne(action.payload.id, state);
		case DivisionActionTypes.DivisionPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryDivisionModel({})
		};
		case DivisionActionTypes.DivisionPageLoaded: {
			return adapter.addMany(action.payload.division, {
				...initialDivisionState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}
export const getDivisionState = createFeatureSelector<DivisionState>('division');
export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
