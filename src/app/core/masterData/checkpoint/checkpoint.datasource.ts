import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
import { AppState } from '../../reducers';
import { selectCheckpointInStore, selectCheckpointPageLoading, selectCheckpointShowInitWaitingMessage } from './checkpoint.selector';


export class CheckpointDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectCheckpointPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectCheckpointShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectCheckpointInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
