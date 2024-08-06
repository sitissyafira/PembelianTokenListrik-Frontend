// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { PkgsActions, PkgsActionTypes } from './pkgs.action';
// CRUD

// Models
import { PkgsModel } from './pkgs.model';
import { QueryPkgsModel } from './querypkgs.model';

// tslint:disable-next-line:no-empty-interface
export interface PkgsState extends EntityState<PkgsModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedPkgsId: string;
	lastQuery: QueryPkgsModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<PkgsModel> = createEntityAdapter<PkgsModel>(
	{ selectId: model => model._id, }
);

export const initialPkgsState: PkgsState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryPkgsModel({}),
	lastCreatedPkgsId: undefined,
	showInitWaitingMessage: true
});

export function pkgsReducer(state = initialPkgsState, action: PkgsActions): PkgsState {
	switch  (action.type) {
		case PkgsActionTypes.PkgsPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedPkgsId: undefined
		};
		case PkgsActionTypes.PkgsActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case PkgsActionTypes.PkgsOnServerCreated: return {
			...state
		};
		case PkgsActionTypes.PkgsCreated: return adapter.addOne(action.payload.pkgs, {
			...state, lastCreatedBlockId: action.payload.pkgs._id
		});
		case PkgsActionTypes.PkgsUpdated: return adapter.updateOne(action.payload.partialPkgs, state);
		case PkgsActionTypes.PkgsDeleted: return adapter.removeOne(action.payload.id, state);
		case PkgsActionTypes.PkgsPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryPkgsModel({})
		};
		case PkgsActionTypes.PkgsPageLoaded: {
			return adapter.addMany(action.payload.pkgs, {
				...initialPkgsState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getPkgsState = createFeatureSelector<PkgsState>('pkgs');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
