// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { EngineerActions, EngineerActionTypes } from './engineer.action';
// CRUD
import { QueryEngineerModel } from './queryengineer.model';
// Models
import { EngineerModel } from './engineer.model';

// tslint:disable-next-line:no-empty-interface
export interface EngineerState extends EntityState<EngineerModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedEngineerId: string;
	lastQuery: QueryEngineerModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<EngineerModel> = createEntityAdapter<EngineerModel>(
	{ selectId: model => model._id, }
);

export const initialEngineerState: EngineerState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryEngineerModel({}),
	lastCreatedEngineerId: undefined,
	showInitWaitingMessage: true
});

export function engineerReducer(state = initialEngineerState, action: EngineerActions): EngineerState {
	switch  (action.type) {
		case EngineerActionTypes.EngineerPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedEngineerId: undefined
		};
		case EngineerActionTypes.EngineerActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case EngineerActionTypes.EngineerOnServerCreated: return {
			...state
		};
		case EngineerActionTypes.EngineerCreated: return adapter.addOne(action.payload.engineer, {
			...state, lastCreatedBlockId: action.payload.engineer._id
		});
		case EngineerActionTypes.EngineerUpdated: return adapter.updateOne(action.payload.partialEngineer, state);
		case EngineerActionTypes.EngineerDeleted: return adapter.removeOne(action.payload.id, state);
		case EngineerActionTypes.EngineerPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryEngineerModel({})
		};
		case EngineerActionTypes.EngineerPageLoaded: {
			return adapter.addMany(action.payload.engineer, {
				...initialEngineerState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getEngineerState = createFeatureSelector<EngineerState>('engineer');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
