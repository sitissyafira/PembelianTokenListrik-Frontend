// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../reducers';
import { selectVoidBillInStore, selectVoidBillPageLoading, selectVoidBillShowInitWaitingMessage } from './voidBill.selector';


export class VoidBillDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectVoidBillPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectVoidBillShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectVoidBillInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
