import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
import { AppState } from '../../../core/reducers';
import { selectVendorInStore, selectVendorPageLoading, selectVendorShowInitWaitingMessage } from './vendor.selector';


export class VendorDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectVendorPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectVendorShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectVendorInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
