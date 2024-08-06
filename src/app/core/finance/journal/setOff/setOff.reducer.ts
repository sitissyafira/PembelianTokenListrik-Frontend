// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { SetOffActions, SetOffActionTypes } from './setOff.action';
// CRUD

// Models
import { SetOffModel } from './setOff.model';
import { QuerySetOffModel } from './querysetOff.model';

// tslint:disable-next-line:no-empty-interface
export interface SetOffState extends EntityState<SetOffModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedSetOffId: string;
	lastQuery: QuerySetOffModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<SetOffModel> = createEntityAdapter<SetOffModel>(
	{ selectId: model => model._id, }
);

export const initialSetOffState: SetOffState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery: new QuerySetOffModel({}),
	lastCreatedSetOffId: undefined,
	showInitWaitingMessage: true
});

export function setOffReducer(state = initialSetOffState, action: SetOffActions): SetOffState {
	switch (action.type) {
		case SetOffActionTypes.SetOffPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedSetOffId: undefined
		};
		case SetOffActionTypes.SetOffActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case SetOffActionTypes.SetOffOnServerCreated: return {
			...state
		};
		case SetOffActionTypes.SetOffCreated: return adapter.addOne(action.payload.setOff, {
			...state, lastCreatedBlockId: action.payload.setOff._id
		});
		case SetOffActionTypes.SetOffUpdated: return adapter.updateOne(action.payload.psetOfftialSetOff, state);
		case SetOffActionTypes.SetOffDeleted: return adapter.removeOne(action.payload.id, state);
		case SetOffActionTypes.SetOffPageCancelled: return {
			...state, listLoading: false, lastQuery: new QuerySetOffModel({})
		};
		case SetOffActionTypes.SetOffPageLoaded: {
			return adapter.addMany(action.payload.setOff, {
				...initialSetOffState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getSetOffState = createFeatureSelector<SetOffState>('setOff');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
