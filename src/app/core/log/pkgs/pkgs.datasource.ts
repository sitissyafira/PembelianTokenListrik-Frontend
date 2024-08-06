// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../../core/reducers';
import { selectPkgsInStore, selectPkgsPageLoading, selectPkgsShowInitWaitingMessage } from './pkgs.selector';


export class PkgsDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectPkgsPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectPkgsShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectPkgsInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
