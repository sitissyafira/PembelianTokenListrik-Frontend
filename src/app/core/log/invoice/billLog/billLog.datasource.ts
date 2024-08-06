
import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../../_base/crud';
import { AppState } from '../../../../core/reducers';
import { selectBillLogInStore, selectBillLogPageLoading, selectBillLogShowInitWaitingMessage } from './billLog.selector';


export class BillLogDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectBillLogPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectBillLogShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectBillLogInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
