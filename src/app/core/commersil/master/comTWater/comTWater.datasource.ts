import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../../_base/crud';
import { AppState } from '../../../../core/reducers';
import { selectComTWaterInStore, selectComTWaterPageLoading, selectComTWaterShowInitWaitingMessage } from './comTWater.selector';


export class ComTWaterDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectComTWaterPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectComTWaterShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectComTWaterInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
