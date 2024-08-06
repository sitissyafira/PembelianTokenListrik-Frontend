// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { ApplicationActions, ApplicationActionTypes } from './application.action';
// CRUD

// Models
import { ApplicationModel } from './application.model';
import { QueryApplicationModel } from './queryapplication.model';

// tslint:disable-next-line:no-empty-interface
export interface ApplicationState extends EntityState<ApplicationModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedApplicationId: string;
	lastQuery: QueryApplicationModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<ApplicationModel> = createEntityAdapter<ApplicationModel>(
	{ selectId: model => model._id, }
);

export const initialApplicationState: ApplicationState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryApplicationModel({}),
	lastCreatedApplicationId: undefined,
	showInitWaitingMessage: true
});

export function applicationReducer(state = initialApplicationState, action: ApplicationActions): ApplicationState {
	switch  (action.type) {
		case ApplicationActionTypes.ApplicationPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedApplicationId: undefined
		};
		case ApplicationActionTypes.ApplicationActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case ApplicationActionTypes.ApplicationOnServerCreated: return {
			...state
		};
		case ApplicationActionTypes.ApplicationCreated: return adapter.addOne(action.payload.application, {
			...state, lastCreatedBlockId: action.payload.application._id
		});
		case ApplicationActionTypes.ApplicationUpdated: return adapter.updateOne(action.payload.partialApplication, state);
		case ApplicationActionTypes.ApplicationDeleted: return adapter.removeOne(action.payload.id, state);
		case ApplicationActionTypes.ApplicationPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryApplicationModel({})
		};
		case ApplicationActionTypes.ApplicationPageLoaded: {
			return adapter.addMany(action.payload.application, {
				...initialApplicationState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getApplicationState = createFeatureSelector<ApplicationState>('application');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
