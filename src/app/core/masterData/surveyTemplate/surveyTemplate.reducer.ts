
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { SurveyTemplateActions, SurveyTemplateActionTypes } from './surveyTemplate.action';
import { SurveyTemplateModel } from './surveyTemplate.model';
import { QuerySurveyTemplateModel } from './querysurveyTemplate.model';

export interface SurveyTemplateState extends EntityState<SurveyTemplateModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedSurveyTemplateId: string;
	lastQuery: QuerySurveyTemplateModel;
	showInitWaitingMessage: boolean;
}
export const adapter: EntityAdapter<SurveyTemplateModel> = createEntityAdapter<SurveyTemplateModel>(
	{ selectId: model => model._id, }
);
export const initialSurveyTemplateState: SurveyTemplateState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QuerySurveyTemplateModel({}),
	lastCreatedSurveyTemplateId: undefined,
	showInitWaitingMessage: true
});
export function surveyTemplateReducer(state = initialSurveyTemplateState, action: SurveyTemplateActions): SurveyTemplateState {
	switch  (action.type) {
		case SurveyTemplateActionTypes.SurveyTemplatePageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedSurveyTemplateId: undefined
		};
		case SurveyTemplateActionTypes.SurveyTemplateActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case SurveyTemplateActionTypes.SurveyTemplateOnServerCreated: return {
			...state
		};
		case SurveyTemplateActionTypes.SurveyTemplateCreated: return adapter.addOne(action.payload.surveyTemplate, {
			...state, lastCreatedBlockId: action.payload.surveyTemplate._id
		});
		case SurveyTemplateActionTypes.SurveyTemplateUpdated: return adapter.updateOne(action.payload.partialSurveyTemplate, state);
		case SurveyTemplateActionTypes.SurveyTemplateDeleted: return adapter.removeOne(action.payload.id, state);
		case SurveyTemplateActionTypes.SurveyTemplatePageCancelled: return {
			...state, listLoading: false, lastQuery: new QuerySurveyTemplateModel({})
		};
		case SurveyTemplateActionTypes.SurveyTemplatePageLoaded: {
			return adapter.addMany(action.payload.surveyTemplate, {
				...initialSurveyTemplateState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}
export const getSurveyTemplateState = createFeatureSelector<SurveyTemplateState>('surveyTemplate');
export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
