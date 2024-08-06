import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';
import {SurveyTemplateModel} from "../../../../../core/masterData/surveyTemplate/surveyTemplate.model";
import {
	selectSurveyTemplateActionLoading,
	selectSurveyTemplateById
} from "../../../../../core/masterData/surveyTemplate/surveyTemplate.selector";
import {SurveyTemplateService} from '../../../../../core/masterData/surveyTemplate/surveyTemplate.service';
import { BlockService } from '../../../../../core/block/block.service';
import { FloorService } from '../../../../../core/floor/floor.service';
import { CheckpointService } from '../../../../../core/masterData/checkpoint/checkpoint.service';
import { QueryCheckpointModel } from '../../../../../core/masterData/checkpoint/querycheckpoint.model';
import { QuerySurveyTemplateModel } from '../../../../../core/masterData/surveyTemplate/querysurveyTemplate.model';
import { MatTable } from '@angular/material';
@Component({
  selector: 'kt-add-surveyTemplate',
  templateUrl: './add-surveyTemplate.component.html',
  styleUrls: ['./add-surveyTemplate.component.scss']
})
export class AddSurveyTemplateComponent implements OnInit, OnDestroy {
	datauser = localStorage.getItem("user");
	surveyTemplate: SurveyTemplateModel;
	SurveyTemplateId$: Observable<string>;
	oldSurveyTemplate: SurveyTemplateModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	surveyTemplateForm: FormGroup;
	hasFormErrors = false;
	loading : boolean = false;

	viewCheckpointForm = new FormControl()

	CheckpointResult: any[] = [];
	CheckpointResultFiltered: any[] = [];

	SurveyResult: any[] = [];
	SurveyResultFiltered: any[] = [];

	viewTowerControl = new FormControl()
	viewFloorControl = new FormControl()

	surveyList: any[] = []
	listQuestion: any[] = []

	typeOptions = [
		"room",
		"equip",
		"vehicle"
	]

	dataSource: any = new BehaviorSubject([]);
	@ViewChild('myTable', { static: false }) table: MatTable<any>;
	displayedColumns = ["question", "actions"];

	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private surveyTemplateFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: SurveyTemplateService,
		private checkpointService: CheckpointService,
		private layoutConfigService: LayoutConfigService,
		private serviceBlk: BlockService,
		private serviceFlr: FloorService,
		private cd: ChangeDetectorRef,
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectSurveyTemplateActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectSurveyTemplateById(id))).subscribe(res => {
					if (res) {
						this.surveyTemplate = res;
						this.oldSurveyTemplate = Object.assign({}, this.surveyTemplate);
						this.initSurveyTemplate();
					}
				});
			} else {
				this.surveyTemplate = new SurveyTemplateModel();
				this.surveyTemplate.clear();
				this.initSurveyTemplate();
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initSurveyTemplate() {
		this.createForm();
		this.getListCheckpoint();
		this.getListSurvey();
	}

	createForm() {
		if (this.surveyTemplate._id){
			this.surveyTemplateForm = this.surveyTemplateFB.group({
				name : [this.surveyTemplate.name, Validators.required],
				checkpoint : [this.surveyTemplate.checkpoint, Validators.required],
				listQuestion: this.surveyTemplateFB.array(this.surveyTemplate.survey.map(el => this.surveyTemplateFB.group(
					{
						question: new FormControl(el)
					}
				)))
			});

		}else{
			this.surveyTemplateForm = this.surveyTemplateFB.group({
				name: ["", Validators.required],
				checkpoint: [[], Validators.required],
				listQuestion: this.surveyTemplateFB.array([this.surveyTemplateFB.group({
					question: new FormControl()
				})])
			});
		}

		this.listQuestion = (this.surveyTemplateForm.get("listQuestion") as FormArray).controls
	}

	getListCheckpoint() {
		let queryparam = new QueryCheckpointModel(
			null,
			1,
			10000
		)
		this.checkpointService.getListCheckpoint(queryparam).subscribe(res => {
			this.CheckpointResult = res.data
			this.CheckpointResultFiltered = this.CheckpointResult.slice()
		})
	}

	getListSurvey() {

		let query = new QuerySurveyTemplateModel(
			null,
			1,
			1000
		)
		
		this.service.getListSurveyTemplate(query).subscribe(res => {
			this.SurveyResult = res.data
			this.SurveyResultFiltered = this.SurveyResult.slice()
		})
	}

	goBackWithId() {
		const url = `/surveyTemplate`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshSurveyTemplate(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/surveyTemplate/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.surveyTemplateForm.controls;
		if (this.surveyTemplateForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedSurveyTemplate = this.prepareSurveyTemplate();
		console.log(editedSurveyTemplate, 'editedSurveyTemplate')
		if (editedSurveyTemplate._id) {
			this.updateSurveyTemplate(editedSurveyTemplate, withBack);
			return;
		}
		this.addSurveyTemplate(editedSurveyTemplate, withBack);
	}

	prepareSurveyTemplate(): SurveyTemplateModel {
		const controls = this.surveyTemplateForm.controls;
		const _surveyTemplate = new SurveyTemplateModel();
		_surveyTemplate.clear();
		_surveyTemplate._id = this.surveyTemplate._id;
		_surveyTemplate.name = controls.name.value.toLowerCase();
		_surveyTemplate.checkpoint = controls.checkpoint.value;

		let tempListSurvey: String[] = []
		controls.listQuestion.value.map(e => {
			tempListSurvey.push(e.question)
		})
		_surveyTemplate.survey = tempListSurvey;
		return _surveyTemplate;
	}

	addSurveyTemplate( _surveyTemplate: SurveyTemplateModel, withBack: boolean = false) {
		const addSubscription = this.service.createSurveyTemplate(_surveyTemplate).subscribe(
			res => {
				const message = `New surveyTemplate successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/surveyTemplate`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding surveyTemplate | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	updateSurveyTemplate(_surveyTemplate: SurveyTemplateModel, withBack: boolean = false) {
		const addSubscription = this.service.updateSurveyTemplate(_surveyTemplate).subscribe(
			res => {
				const message = `SurveyTemplate successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/surveyTemplate`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding surveyTemplate | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = 'Create SurveyTemplate';
		if (!this.surveyTemplate || !this.surveyTemplate._id) {
			return result;
		}

		result = `Edit SurveyTemplate`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	_filterAuto(e, type) {
		if(type === 'checkpoint'){
			this.CheckpointResultFiltered = this.CheckpointResult.filter(item => item.name.toLowerCase().includes(e.target.value.toLowerCase()))
		}
		if(type === 'survey'){
			this.SurveyResultFiltered = this.SurveyResult.filter(item => item.name.toLowerCase().includes(e.target.value.toLowerCase()))
		}
	}

	setItem(item, type) {
		const controls = this.surveyTemplateForm.controls
		console.log(controls, 'con')
		if(type === 'checkpoint'){
			let tempCP = controls[type].value
			tempCP.push(item)
			controls[type].setValue(tempCP)
			this.viewCheckpointForm.reset()
		}

		else {
			controls[type].setValue(item)
		}
	}
	addQuestionToList(id){
		let questionsArray = this.surveyTemplateForm.controls['listQuestion'] as FormArray
		questionsArray.push(this.surveyTemplateFB.group({
			question: new FormControl(),
		  })
		)

		this.cd.markForCheck()
		this.listQuestion = (this.surveyTemplateForm.get('listQuestion') as FormArray).controls
		this.table.dataSource= this.listQuestion
		this.table.renderRows();
	}

	removeQuestionFromList(id) {
		let questionsArray = this.surveyTemplateForm.controls['listQuestion'] as FormArray
		questionsArray.removeAt(id)
		this.listQuestion = (this.surveyTemplateForm.get('listQuestion') as FormArray).controls

		this.cd.markForCheck()
		
		this.table.dataSource= this.listQuestion
		this.table.renderRows();

	}

	_deleteCPList(item) {
		let tempCP = this.surveyTemplateForm.controls['checkpoint'].value.filter(e =>
			{if(e._id != item._id) return e})

		this.surveyTemplateForm.controls['checkpoint'].setValue(tempCP)
		this.cd.markForCheck()

	}
}
