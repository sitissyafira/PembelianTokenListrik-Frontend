// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../../core/reducers';
import { selectBlockInStore, selectBlockPageLoading, selectBlockShowInitWaitingMessage } from './block.selector';


export class BlockDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectBlockPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectBlockShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectBlockInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
