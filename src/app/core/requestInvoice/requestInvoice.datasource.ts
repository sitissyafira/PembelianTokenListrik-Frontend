import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
import { AppState } from '../../core/reducers';
import { selectRequestInvoiceInStore, selectRequestInvoicePageLoading, selectRequestInvoiceShowInitWaitingMessage } from './requestInvoice.selector';


export class RequestInvoiceDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectRequestInvoicePageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectRequestInvoiceShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectRequestInvoiceInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
