// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../../core/reducers';
import { selectUnitInStore, selectUnitPageLoading, selectUnitShowInitWaitingMessage } from './unit.selector';


export class UnitDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectUnitPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectUnitShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectUnitInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
