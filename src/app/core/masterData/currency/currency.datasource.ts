import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
import { AppState } from '../../../core/reducers';
import { selectCurrencyInStore, selectCurrencyPageLoading, selectCurrencyShowInitWaitingMessage } from './currency.selector';


export class CurrencyDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectCurrencyPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectCurrencyShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectCurrencyInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
