// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../reducers';
import { selectInvoiceInStore, selectInvoicePageLoading, selectInvoiceShowInitWaitingMessage } from './invoice.selector';


export class InvoiceDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectInvoicePageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectInvoiceShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectInvoiceInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
