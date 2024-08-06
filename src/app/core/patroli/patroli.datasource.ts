// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../reducers';
import { selectPatroliInStore, selectPatroliPageLoading, selectPatroliShowInitWaitingMessage } from './patroli.selector';


export class PatroliDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectPatroliPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectPatroliShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectPatroliInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
