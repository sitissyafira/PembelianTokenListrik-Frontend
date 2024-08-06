import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
import { AppState } from '../../../core/reducers';
import { selectVndrCategoryInStore, selectVndrCategoryPageLoading, selectVndrCategoryShowInitWaitingMessage } from './vndrCategory.selector';


export class VndrCategoryDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectVndrCategoryPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectVndrCategoryShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectVndrCategoryInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
