import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
import { AppState } from '../../../core/reducers';
import { selectTaxInStore, selectTaxPageLoading, selectTaxShowInitWaitingMessage } from './tax.selector';


export class TaxDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectTaxPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectTaxShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectTaxInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
