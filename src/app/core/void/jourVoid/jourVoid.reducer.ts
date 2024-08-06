// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { JourVoidActions, JourVoidActionTypes } from './jourVoid.action';
// CRUD
import { QueryJourVoidModel } from './queryjourVoid.model';
// Models
import { JourVoidModel } from './jourVoid.model';

// tslint:disable-next-line:no-empty-interface
export interface JourVoidState extends EntityState<JourVoidModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedJourVoidId: string;
	lastQuery: QueryJourVoidModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<JourVoidModel> = createEntityAdapter<JourVoidModel>(
	{ selectId: model => model._id, }
);

export const initialJourVoidState: JourVoidState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery: new QueryJourVoidModel({}),
	lastCreatedJourVoidId: undefined,
	showInitWaitingMessage: true
});

export function jourVoidReducer(state = initialJourVoidState, action: JourVoidActions): JourVoidState {
	switch (action.type) {
		case JourVoidActionTypes.JourVoidPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedJourVoidId: undefined
		};
		case JourVoidActionTypes.JourVoidActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case JourVoidActionTypes.JourVoidOnServerCreated: return {
			...state
		};
		case JourVoidActionTypes.JourVoidCreated: return adapter.addOne(action.payload.jourVoid, {
			...state, lastCreatedJourVoidId: action.payload.jourVoid._id
		});
		case JourVoidActionTypes.JourVoidUpdated: return adapter.updateOne(action.payload.partialJourVoid, state);
		case JourVoidActionTypes.JourVoidDeleted: return adapter.removeOne(action.payload.id, state);
		case JourVoidActionTypes.JourVoidPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryJourVoidModel({})
		};
		case JourVoidActionTypes.JourVoidPageLoaded: {
			return adapter.addMany(action.payload.jourVoid, {
				...initialJourVoidState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getJourVoidState = createFeatureSelector<JourVoidState>('jourVoid');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
