// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../reducers';
import { selectEmergencyInStore, selectEmergencyPageLoading, selectEmergencyShowInitWaitingMessage } from './emergency.selector';


export class EmergencyDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectEmergencyPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectEmergencyShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectEmergencyInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
