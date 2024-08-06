// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { SubdefectActions, SubdefectActionTypes } from './subdefect.action';
// CRUD

// Models
import { SubdefectModel } from './subdefect.model';
import { QuerySubdefectModel } from './querysubdefect.model';

// tslint:disable-next-line:no-empty-interface
export interface SubdefectState extends EntityState<SubdefectModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedSubdefectId: string;
	lastQuery: QuerySubdefectModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<SubdefectModel> = createEntityAdapter<SubdefectModel>(
	{ selectId: model => model._id, }
);

export const initialSubdefectState: SubdefectState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QuerySubdefectModel({}),
	lastCreatedSubdefectId: undefined,
	showInitWaitingMessage: true
});

export function subdefectReducer(state = initialSubdefectState, action: SubdefectActions): SubdefectState {
	switch  (action.type) {
		case SubdefectActionTypes.SubdefectPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedSubdefectId: undefined
		};
		case SubdefectActionTypes.SubdefectActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case SubdefectActionTypes.SubdefectOnServerCreated: return {
			...state
		};
		case SubdefectActionTypes.SubdefectCreated: return adapter.addOne(action.payload.subdefect, {
			...state, lastCreatedBlockId: action.payload.subdefect._id
		});
		case SubdefectActionTypes.SubdefectUpdated: return adapter.updateOne(action.payload.partialSubdefect, state);
		case SubdefectActionTypes.SubdefectDeleted: return adapter.removeOne(action.payload.id, state);
		case SubdefectActionTypes.SubdefectPageCancelled: return {
			...state, listLoading: false, lastQuery: new QuerySubdefectModel({})
		};
		case SubdefectActionTypes.SubdefectPageLoaded: {
			return adapter.addMany(action.payload.subdefect, {
				...initialSubdefectState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getSubdefectState = createFeatureSelector<SubdefectState>('subdefect');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
