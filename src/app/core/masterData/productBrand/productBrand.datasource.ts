import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
import { AppState } from '../../../core/reducers';
import { selectProductBrandInStore, selectProductBrandPageLoading, selectProductBrandShowInitWaitingMessage } from './productBrand.selector';


export class ProductBrandDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectProductBrandPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectProductBrandShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectProductBrandInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
