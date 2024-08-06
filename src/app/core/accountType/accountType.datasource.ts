// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../../core/reducers';
import { selectAccountTypeInStore, selectAccountTypePageLoading, selectAccountTypeShowInitWaitingMessage } from './accountType.selector';


export class AccountTypeDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectAccountTypePageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectAccountTypeShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectAccountTypeInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
