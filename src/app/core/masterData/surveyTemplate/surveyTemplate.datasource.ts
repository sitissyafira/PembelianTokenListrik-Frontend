import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
import { AppState } from '../../reducers';
import { selectSurveyTemplateInStore, selectSurveyTemplatePageLoading, selectSurveyTemplateShowInitWaitingMessage } from './surveyTemplate.selector';


export class SurveyTemplateDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectSurveyTemplatePageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectSurveyTemplateShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectSurveyTemplateInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
