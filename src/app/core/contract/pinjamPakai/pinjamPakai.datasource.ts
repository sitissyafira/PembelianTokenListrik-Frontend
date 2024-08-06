// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../../core/reducers';
import { selectPinjamPakaiInStore, selectPinjamPakaiPageLoading, selectPinjamPakaiShowInitWaitingMessage } from './pinjamPakai.selector';


export class PinjamPakaiDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectPinjamPakaiPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectPinjamPakaiShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectPinjamPakaiInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
