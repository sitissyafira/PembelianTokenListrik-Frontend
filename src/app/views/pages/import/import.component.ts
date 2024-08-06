import {Component, OnInit} from '@angular/core';
import {FileUploader} from 'ng2-file-upload';
import {LayoutConfigService, SubheaderService} from '../../../core/_base/layout';
import {LayoutUtilsService, MessageType, QueryParamsModel} from '../../../core/_base/crud';
import {HttpClient} from '@angular/common/http';
import { environment } from '../../../../environments/environment';

const URL = `${environment.baseAPI}/api/excel/project/import`;

@Component({
  selector: 'kt-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {
	file;


	constructor(
		private layoutUtilsService: LayoutUtilsService,
		private http: HttpClient,
		private layoutConfigService: LayoutConfigService) { }

  ngOnInit() {
  }

  selectFile(event) {
		if(event.target.files.length > 0) {
			const file = event.target.files[0];
			this.file = file;
		}
  }

  onSubmit(){
		const formData = new FormData();
		formData.append('file', this.file);

		this.http.post<any>(`${environment.baseAPI}/api/excel/project/import`, formData).subscribe(
			(res) => console.log(res),
			(err) => console.log(err)
		)
  }

}
