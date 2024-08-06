// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../../_base/crud';
// State
import { AppState } from '../../../reducers';
import { selectSetOffInStore, selectSetOffPageLoading, selectSetOffShowInitWaitingMessage } from './setOff.selector';


export class SetOffDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectSetOffPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectSetOffShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectSetOffInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
