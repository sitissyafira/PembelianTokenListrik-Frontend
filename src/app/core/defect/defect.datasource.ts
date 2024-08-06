// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../../core/reducers';
import { selectDefectInStore, selectDefectPageLoading, selectDefectShowInitWaitingMessage } from './defect.selector';


export class DefectDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectDefectPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectDefectShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectDefectInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
