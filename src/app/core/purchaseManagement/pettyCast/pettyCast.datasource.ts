import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
import { AppState } from '../../../core/reducers';
import { selectPettyCastInStore, selectPettyCastPageLoading, selectPettyCastShowInitWaitingMessage } from './pettyCast.selector';


export class PettyCastDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();
		this.loading$ = this.store.pipe(
			select(selectPettyCastPageLoading)
		);
		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectPettyCastShowInitWaitingMessage)
		);
		this.store.pipe(
			select(selectPettyCastInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
