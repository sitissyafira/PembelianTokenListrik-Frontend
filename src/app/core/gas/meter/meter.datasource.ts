// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../../core/reducers';
import { selectGasMeterInStore, selectGasMeterPageLoading, selectGasMeterShowInitWaitingMessage } from './meter.selector';


export class GasMeterDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectGasMeterPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectGasMeterShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectGasMeterInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
