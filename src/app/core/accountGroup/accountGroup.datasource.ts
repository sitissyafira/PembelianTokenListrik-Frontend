// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../../core/reducers';
import { selectAccountGroupInStore, selectAccountGroupPageLoading, selectAccountGroupShowInitWaitingMessage } from './accountGroup.selector';


export class AccountGroupDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectAccountGroupPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectAccountGroupShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectAccountGroupInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
