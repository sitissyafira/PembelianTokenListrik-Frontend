import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
import { AppState } from '../../../core/reducers';
import { selectLogFinanceInStore, selectLogFinancePageLoading, selectLogFinanceShowInitWaitingMessage } from './logFinance.selector';


export class LogFinanceDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectLogFinancePageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectLogFinanceShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectLogFinanceInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
