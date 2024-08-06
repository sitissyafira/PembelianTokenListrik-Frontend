// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../../_base/crud';
// State
import { AppState } from '../../../reducers';
import { selectDebitNoteInStore, selectDebitNotePageLoading, selectDebitNoteShowInitWaitingMessage } from './debitNote.selector';


export class DebitNoteDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectDebitNotePageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectDebitNoteShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectDebitNoteInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
