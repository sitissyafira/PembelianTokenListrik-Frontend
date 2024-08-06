import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
import { SurveyTemplateState } from './surveyTemplate.reducer';
import { each } from 'lodash';
import { SurveyTemplateModel } from './surveyTemplate.model';


export const selectSurveyTemplateState = createFeatureSelector<SurveyTemplateState>('surveyTemplate');

export const selectSurveyTemplateById = (surveyTemplateId: string) => createSelector(
	selectSurveyTemplateState,
	surveyTemplateState =>  surveyTemplateState.entities[surveyTemplateId]
);
export const selectSurveyTemplatePageLoading = createSelector(
	selectSurveyTemplateState,
	surveyTemplateState => {
		return surveyTemplateState.listLoading;
	}
);
export const selectSurveyTemplateActionLoading = createSelector(
	selectSurveyTemplateState,
	surveyTemplateState => surveyTemplateState.actionsloading
);
export const selectLastCreatedSurveyTemplateId = createSelector(
	selectSurveyTemplateState,
	surveyTemplateState => surveyTemplateState.lastCreatedSurveyTemplateId
);
export const selectSurveyTemplatePageLastQuery = createSelector(
	selectSurveyTemplateState,
	surveyTemplateState => surveyTemplateState.lastQuery
);
export const selectSurveyTemplateInStore = createSelector(
	selectSurveyTemplateState,
	surveyTemplateState => {
		const items: SurveyTemplateModel[] = [];
		each(surveyTemplateState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: SurveyTemplateModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, surveyTemplateState.totalCount, '');
	}
);
export const selectSurveyTemplateShowInitWaitingMessage = createSelector(
	selectSurveyTemplateState,
	surveyTemplateState => surveyTemplateState.showInitWaitingMessage
);
export const selectHasSurveyTemplateInStore = createSelector(
	selectSurveyTemplateState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
