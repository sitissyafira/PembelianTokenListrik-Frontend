// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { LogactionActions, LogactionActionTypes } from './logaction.action';
// CRUD

// Models
import { LogactionModel } from './logaction.model';
import { QueryLogactionModel } from './querylogaction.model';

// tslint:disable-next-line:no-empty-interface
export interface LogactionState extends EntityState<LogactionModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedLogactionId: string;
	lastQuery: QueryLogactionModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<LogactionModel> = createEntityAdapter<LogactionModel>(
	{ selectId: model => model._id, }
);

export const initialLogactionState: LogactionState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryLogactionModel({}),
	lastCreatedLogactionId: undefined,
	showInitWaitingMessage: true
});

export function logactionReducer(state = initialLogactionState, action: LogactionActions): LogactionState {
	switch  (action.type) {
		case LogactionActionTypes.LogactionPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedLogactionId: undefined
		};
		case LogactionActionTypes.LogactionActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case LogactionActionTypes.LogactionOnServerCreated: return {
			...state
		};
		case LogactionActionTypes.LogactionCreated: return adapter.addOne(action.payload.logaction, {
			...state, lastCreatedBlockId: action.payload.logaction._id
		});
		case LogactionActionTypes.LogactionUpdated: return adapter.updateOne(action.payload.partialLogaction, state);
		case LogactionActionTypes.LogactionDeleted: return adapter.removeOne(action.payload.id, state);
		case LogactionActionTypes.LogactionPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryLogactionModel({})
		};
		case LogactionActionTypes.LogactionPageLoaded: {
			return adapter.addMany(action.payload.logaction, {
				...initialLogactionState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getLogactionState = createFeatureSelector<LogactionState>('logaction');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
