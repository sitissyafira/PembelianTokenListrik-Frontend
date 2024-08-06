import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../../_base/crud';
import { AppState } from '../../../../core/reducers';
import { selectComTypeInStore, selectComTypePageLoading, selectComTypeShowInitWaitingMessage } from './comType.selector';


export class ComTypeDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectComTypePageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectComTypeShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectComTypeInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
