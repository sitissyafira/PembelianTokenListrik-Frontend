// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { DefectActions, DefectActionTypes } from './defect.action';
// CRUD

// Models
import { DefectModel } from './defect.model';
import { QueryDefectModel } from './querydefect.model';

// tslint:disable-next-line:no-empty-interface
export interface DefectState extends EntityState<DefectModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedDefectId: string;
	lastQuery: QueryDefectModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<DefectModel> = createEntityAdapter<DefectModel>(
	{ selectId: model => model._id, }
);

export const initialDefectState: DefectState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryDefectModel({}),
	lastCreatedDefectId: undefined,
	showInitWaitingMessage: true
});

export function defectReducer(state = initialDefectState, action: DefectActions): DefectState {
	switch  (action.type) {
		case DefectActionTypes.DefectPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedDefectId: undefined
		};
		case DefectActionTypes.DefectActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case DefectActionTypes.DefectOnServerCreated: return {
			...state
		};
		case DefectActionTypes.DefectCreated: return adapter.addOne(action.payload.defect, {
			...state, lastCreatedBlockId: action.payload.defect._id
		});
		case DefectActionTypes.DefectUpdated: return adapter.updateOne(action.payload.partialDefect, state);
		case DefectActionTypes.DefectDeleted: return adapter.removeOne(action.payload.id, state);
		case DefectActionTypes.DefectPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryDefectModel({})
		};
		case DefectActionTypes.DefectPageLoaded: {
			return adapter.addMany(action.payload.defect, {
				...initialDefectState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getDefectState = createFeatureSelector<DefectState>('defect');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
