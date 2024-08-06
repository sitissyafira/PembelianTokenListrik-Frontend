// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../../core/reducers';
import { selectBlockGroupInStore, selectBlockGroupPageLoading, selectBlockGroupShowInitWaitingMessage } from './blockgroup.selector';


export class BlockGroupDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectBlockGroupPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectBlockGroupShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectBlockGroupInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
