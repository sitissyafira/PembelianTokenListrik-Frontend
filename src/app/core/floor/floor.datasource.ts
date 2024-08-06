// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../../core/reducers';
import { selectFloorInStore, selectFloorPageLoading, selectFloorShowInitWaitingMessage } from './floor.selector';


export class FloorDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectFloorPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectFloorShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectFloorInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
