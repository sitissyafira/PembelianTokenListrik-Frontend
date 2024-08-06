// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { AmActions, AmActionTypes } from './am.action';
// CRUD

// Models
import { AmModel } from './am.model';
import { QueryAmModel } from './queryam.model';

// tslint:disable-next-line:no-empty-interface
export interface AmState extends EntityState<AmModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedAmId: string;
	lastQuery: QueryAmModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<AmModel> = createEntityAdapter<AmModel>(
	{ selectId: model => model._id, }
);

export const initialAmState: AmState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryAmModel({}),
	lastCreatedAmId: undefined,
	showInitWaitingMessage: true
});

export function amReducer(state = initialAmState, action: AmActions): AmState {
	switch  (action.type) {
		case AmActionTypes.AmPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedAmId: undefined
		};
		case AmActionTypes.AmActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case AmActionTypes.AmOnServerCreated: return {
			...state
		};
		case AmActionTypes.AmCreated: return adapter.addOne(action.payload.am, {
			...state, lastCreatedBlockId: action.payload.am._id
		});
		case AmActionTypes.AmUpdated: return adapter.updateOne(action.payload.partialAm, state);
		case AmActionTypes.AmDeleted: return adapter.removeOne(action.payload.id, state);
		case AmActionTypes.AmPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryAmModel({})
		};
		case AmActionTypes.AmPageLoaded: {
			return adapter.addMany(action.payload.am, {
				...initialAmState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getAmState = createFeatureSelector<AmState>('a');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
