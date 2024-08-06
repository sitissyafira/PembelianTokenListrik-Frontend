// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../../_base/crud';
// State
import { AppState } from '../../../reducers';
import { selectFacilityInStore, selectFacilityPageLoading, selectFacilityShowInitWaitingMessage } from './facility.selector';


export class FacilityDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectFacilityPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectFacilityShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectFacilityInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
