// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../../_base/crud';
// State
import { AppState } from '../../../reducers';
import { selectMasterInStore, selectMasterPageLoading, selectMasterShowInitWaitingMessage } from './master.selector';


export class MasterDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectMasterPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectMasterShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectMasterInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
