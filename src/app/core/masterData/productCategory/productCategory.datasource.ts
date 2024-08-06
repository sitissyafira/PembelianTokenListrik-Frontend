import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
import { AppState } from '../../../core/reducers';
import { selectProductCategoryInStore, selectProductCategoryPageLoading, selectProductCategoryShowInitWaitingMessage } from './productCategory.selector';


export class ProductCategoryDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectProductCategoryPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectProductCategoryShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectProductCategoryInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
