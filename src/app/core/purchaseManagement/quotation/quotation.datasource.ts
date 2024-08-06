import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
import { AppState } from '../../../core/reducers';
import { selectQuotationInStore, selectQuotationPageLoading, selectQuotationShowInitWaitingMessage } from './quotation.selector';


export class QuotationDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectQuotationPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectQuotationShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectQuotationInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
