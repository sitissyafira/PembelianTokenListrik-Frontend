// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { VisitorActions, VisitorActionTypes } from './visitor.action';
// CRUD

// Models
import { VisitorModel } from './visitor.model';
import { QueryVisitorModel } from './queryvisitor.model';

// tslint:disable-next-line:no-empty-interface
export interface VisitorState extends EntityState<VisitorModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedVisitorId: string;
	lastQuery: QueryVisitorModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<VisitorModel> = createEntityAdapter<VisitorModel>(
	{ selectId: model => model._id, }
);

export const initialVisitorState: VisitorState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryVisitorModel(undefined, undefined, undefined),
	lastCreatedVisitorId: undefined,
	showInitWaitingMessage: true
});

export function visitorReducer(state = initialVisitorState, action: VisitorActions): VisitorState {
	switch  (action.type) {
		case VisitorActionTypes.VisitorPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedVisitorId: undefined
		};
		case VisitorActionTypes.VisitorActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case VisitorActionTypes.VisitorOnServerCreated: return {
			...state
		};
		case VisitorActionTypes.VisitorCreated: return adapter.addOne(action.payload.visitor, {
			...state, lastCreatedBlockId: action.payload.visitor._id
		});
		case VisitorActionTypes.VisitorUpdated: return adapter.updateOne(action.payload.partialVisitor, state);
		case VisitorActionTypes.VisitorDeleted: return adapter.removeOne(action.payload.id, state);
		case VisitorActionTypes.VisitorPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryVisitorModel({})
		};
		case VisitorActionTypes.VisitorPageLoaded: {
			return adapter.addMany(action.payload.visitor, {
				...initialVisitorState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getVisitorState = createFeatureSelector<VisitorState>('visitor');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
