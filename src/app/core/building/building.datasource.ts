// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../../core/reducers';
import { selectBuildingInStore, selectBuildingPageLoading, selectBuildingShowInitWaitingMessage } from './building.selector';


export class BuildingDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectBuildingPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectBuildingShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectBuildingInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
