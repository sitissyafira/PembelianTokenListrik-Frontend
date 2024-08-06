
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { ApActions, ApActionTypes } from './ap.action';
import { ApModel } from './ap.model';
import { QueryApModel } from './queryap.model';

export interface ApState extends EntityState<ApModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedApId: string;
	lastQuery: QueryApModel;
	showInitWaitingMessage: boolean;
}
export const adapter: EntityAdapter<ApModel> = createEntityAdapter<ApModel>(
	{ selectId: model => model._id, }
);
export const initialApState: ApState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryApModel({}),
	lastCreatedApId: undefined,
	showInitWaitingMessage: true
});
export function apReducer(state = initialApState, action: ApActions): ApState {
	switch  (action.type) {
		case ApActionTypes.ApPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedApId: undefined
		};
		case ApActionTypes.ApActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case ApActionTypes.ApOnServerCreated: return {
			...state
		};
		case ApActionTypes.ApCreated: return adapter.addOne(action.payload.ap, {
			...state, lastCreatedBlockId: action.payload.ap._id
		});
		case ApActionTypes.ApUpdated: return adapter.updateOne(action.payload.partialAp, state);
		case ApActionTypes.ApDeleted: return adapter.removeOne(action.payload.id, state);
		case ApActionTypes.ApPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryApModel({})
		};
		case ApActionTypes.ApPageLoaded: {
			return adapter.addMany(action.payload.ap, {
				...initialApState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}
export const getApState = createFeatureSelector<ApState>('ap');
export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
