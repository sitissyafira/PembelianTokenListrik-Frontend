// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../reducers';
import { selectImportpaymentInStore, selectImportpaymentPageLoading, selectImportpaymentShowInitWaitingMessage } from './importpayment.selector';


export class ImportpaymentDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectImportpaymentPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectImportpaymentShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectImportpaymentInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
