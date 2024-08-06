import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../../_base/crud';
import { AppState } from '../../../../core/reducers';
import { selectComCustomerInStore, selectComCustomerPageLoading, selectComCustomerShowInitWaitingMessage } from './comCustomer.selector';


export class ComCustomerDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectComCustomerPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectComCustomerShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectComCustomerInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
