import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ElementRef} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';
import {PaymentPoModel} from "../../../../../core/purchaseManagement/paymentPo/paymentPo.model";
import {
	selectPaymentPoActionLoading,
	selectPaymentPoById
} from "../../../../../core/purchaseManagement/paymentPo/paymentPo.selector";
import {PaymentPoService} from '../../../../../core/purchaseManagement/paymentPo/paymentPo.service';
import { SelectionModel } from '@angular/cdk/collections';
import { StockProductModel } from '../../../../../core/inventorymanagement/stockProduct/stockProduct.model';
import { MatDialog } from '@angular/material/dialog';
import { QueryQuotationModel } from '../../../../../core/purchaseManagement/quotation/queryquotation.model';
import { QuotationService } from '../../../../../core/purchaseManagement/quotation/quotation.service';
// import { PopupViewPaymentPo } from '../popup-view-paymentPo/popup-view-paymentPo.component';
// import { PopupEditPaymentPo } from '../popup-edit-paymentPo/popup-edit-paymentPo.component';
import { QueryTaxModel } from '../../../../../core/masterData/tax/querytax.model';
import { TaxService } from '../../../../../core/masterData/tax/tax.service';
import { TaxModel } from '../../../../../core/masterData/tax/tax.model';
import { QuotationModel } from '../../../../../core/purchaseManagement/quotation/quotation.model';
import { QueryVendorModel } from '../../../../../core/masterData/vendor/queryvendor.model';
import { VendorService } from '../../../../../core/masterData/vendor/vendor.service';
import { VendorModel } from '../../../../../core/masterData/vendor/vendor.model';
import { PurchaseRequestService } from '../../../../../core/purchaseManagement/purchaseRequest/purchaseRequest.service';
import { ProductBrandService } from '../../../../../core/masterData/productBrand/productBrand.service';
import { UomService } from '../../../../../core/masterData/asset/uom/uom.service';
import { QueryUomModel } from '../../../../../core/masterData/asset/uom/queryuom.model';
import { MatTable } from '@angular/material';
import { ApModel } from '../../../../../core/finance/ap/ap.model';
import { PoReceiptService } from '../../../../../core/purchaseManagement/poReceipt/poReceipt.service';
import { AccountGroupService } from '../../../../../core/accountGroup/accountGroup.service';
import { QueryBankModel } from '../../../../../core/masterData/bank/bank/querybank.model';
import { BankService } from '../../../../../core/masterData/bank/bank/bank.service';
import { ServiceFormat } from '../../../../../core/serviceFormat/format.service';
import { ApService } from '../../../../../core/finance/ap/ap.service';
import { PurchaseOrderModel } from '../../../../../core/purchaseManagement/purchaseOrder/purchaseOrder.model';
@Component({
  selector: 'kt-view-paymentPo',
  templateUrl: './view-paymentPo.component.html',
  styleUrls: ['./view-paymentPo.component.scss']
})
export class ViewpaymentPoComponent implements OnInit, OnDestroy {
	datauser = localStorage.getItem("user");
	paymentPo: PaymentPoModel;
	paymentPoId$: Observable<string>;
	oldpaymentPo: PaymentPoModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	paymentPoForm: FormGroup;
	hasFormErrors = false;
	loading : boolean = false;
	loadingAp = {
		deposit: false,
		submit: false,
		glaccount: false,
		bank: false,
		unit: false
	};
	loadingTax : boolean = false;
	loadingVendor : boolean = false;
	loadingQuo : boolean = false;
	loadingPOR : boolean = false;
	loadingProduct : boolean = false;
	quoResult: any[] = []
	TaxResult: any[] = []
	PORResult: any[] = []
	PORResultFiltered: any[] = []
	typePOList: any[] = [
		{
			type_value: "purchase_request",
			type_label: "Purchase Request"
		},
		{
			type_value: "manual",
			type_label: "Manual"
		},
	]
	discountOptions: any[] = [
		{
			type_value: "fixed",
			type_label: "Fixed"
		},
		{
			type_value: "percentage",
			type_label: "Percentage"
		},
	]
	termOptions: any[] = [
		{
			type_value: "month",
			type_label: "Bulan"
		},
		{
			type_value: "day",
			type_label: "Hari"
		},
	]
	VendorResult: any[] = []
	VendorResultFiltered: any[] = []
	nowDate: any = Date.now()
	po_no: any;
	//quotation_no: any;
	loadingGenerate: boolean
	isApproved: boolean
	//product list is product_name in purchaseRequest
	productList: any[] = [{
		qty: "",
		uom: {uom: ""},
		price: "",
		subTotal: "",
	}]

	productsListFromPR: any[] = []
	products: any[] = []
	ProductResultFiltered: any[] = []
	unavailableProduct: any;

	uom: any[] = []
	uomFiltered: any[] = []

	documents: any[] = []
	selectedDocument: any

	isPreviewPdf: boolean = false;

	selectedPOR: any[] = []
	selectedPO: PurchaseOrderModel;

	//ap form
	apForm: FormGroup;
	ap: ApModel;
	ApId$: Observable<string>;
	apResult: any[] = [];
	glResult: any[] = [];
	accountReceive: any[] = [];
	dateAp = new FormControl(new Date());
	viewPaidFormResult = new FormControl();
	PaidFormResultFiltered = [];
	gLListResultFiltered = [];
	viewGlResult = new FormControl();
	viewGlResult2 = new FormControl();
	bankResult: any[] = [];
	invalid: boolean = false
	balanced: boolean = false
	totalField: number = 0
	apListResultFiltered = [];
	@ViewChild('apTable', { static: false }) apTable: MatTable<any>;
	displayedColumnsAp = ['no', 'gl', 'amount', 'desc', 'isdebit'];

	selection = new SelectionModel<StockProductModel>(true, []);
	selectionAp = new SelectionModel<ApModel>(true, []);
	selectionTax = new SelectionModel<TaxModel>(true, []);
	selectionQuo = new SelectionModel<QuotationModel>(true, []);
	selectionVendor = new SelectionModel<VendorModel>(true, []);

	dataSource: any = new BehaviorSubject([]);
	@ViewChild('myTable', { static: false }) table: MatTable<any>;
	@ViewChild('documentInput', { static: false }) documentInputEl: ElementRef;
	displayedColumns = ["product_code", "product_brand", "qty", "in_qty", "uom", "price", "total"];

	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
    	private dialog: MatDialog,
		private paymentPoFB: FormBuilder,
		private apFB: FormBuilder,
		private serviceQuo: QuotationService,
		private cd: ChangeDetectorRef,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: PaymentPoService,
		private serviceTax: TaxService,
		private serviceVendor: VendorService,
		private servicePR: PurchaseRequestService,
		private servicePOR: PoReceiptService,
		private serviceUom: UomService,
		private serviceBank: BankService,
		private serviceAp: ApService,
		private COAService: AccountGroupService,
		private layoutConfigService: LayoutConfigService,
		private serviceProduct: ProductBrandService,
		private serviceFormat: ServiceFormat,
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectPaymentPoActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			
			const routeSubscription =  this.activatedRoute.params.subscribe(params => {
				const id = params.id;
				this.store.pipe(select(selectPaymentPoById(id))).subscribe(res => {
					if(res){
						this.paymentPo = res
						this.initpaymentPo();
					}
				})
				// this.paymentPo = new PaymentPoModel();
				// this.paymentPo.clear();
	
			});
			this.subscriptions.push(routeSubscription);

		});
		this.subscriptions.push(routeSubscription);
  	}

	initpaymentPo() {
		this.createForm();
		this.getDataAP();
		this.loadPOR();
		this.reloadAllDataPOR();
		// this.loadQuo();
		// this.loadTax();
		// this.loadAllProductList();
		// this.loadVendor();
		// this.loadUom();
		// this.getNumber();

	}

	createForm() {

		this.selectedPOR = this.paymentPo.po_receipt
		this.selectedPO = this.selectedPOR[0].po
		
		this.paymentPoForm = this.paymentPoFB.group({
			// product_name: [undefined, Validators.required],
			
			// isApproved: [""],
			
			created_by: [{value:this.paymentPo.createdBy, disabled:true}, Validators.required],

			po_receipt: [{value: this.paymentPo.po_receipt, disabled: true}, Validators.required],
			po_receipt_no: [{value: "", disabled: true}, Validators.required],

			purchase_invoice_no: [{value: this.paymentPo.purchase_invoice_no.toUpperCase(), disabled: true}, Validators.required],
			po_no: [{value: this.selectedPO.po_no, disabled: true}, Validators.required],
			po: [{value: this.selectedPO, disabled: true}, Validators.required],
			por_no: [{value: "", disabled: true}, Validators.required],
			por: [{value: "", disabled: true}, Validators.required],
			vendor_name: [{value: this.selectedPO.vendor_name.vendor_name.toUpperCase(), disabled: true}, Validators.required],
			ppn: [{value: this.selectedPO.payment.ppn, disabled: true}, Validators.required],
			pph: [{value: this.selectedPO.payment.pph, disabled: true}, Validators.required],
			date: [{value: this.paymentPo.date, disabled: true}, Validators.required],
			planned_payment_date: [{value: this.paymentPo.planned_payment_date, disabled: true}, Validators.required],
			term: [{value: this.selectedPO.term.term, disabled: true}, Validators.required],
			termPeriod: [{value: this.selectedPO.term.termPeriod, disabled: true}, Validators.required],
			discountType: [{value: this.selectedPO.payment.discountType, disabled: true}, Validators.required],
			discountValue: [{value: this.selectedPO.payment.discountValue, disabled: true}, Validators.required],
			shippingCost: [{value: this.selectedPO.payment.shippingCost, disabled: true}, Validators.required],
			notes: [{value: this.paymentPo.note, disabled: true}, Validators.required],
			// subTotal: [{value: this.getSubTotal(this.paymentPo.po_receipt.product), disabled: true}, Validators.required],
			subTotal: [{value: "", disabled: true}, Validators.required],
			grandTotal: [{value: this.selectedPO.grand_total, disabled: true}, Validators.required],
			subTotalPOR: [{value: this.toRupiahString(this.paymentPo.payment.subTotal), disabled: true}, Validators.required],
			grandTotalPOR: [{value: this.toRupiahString(this.paymentPo.payment.grandTotal), disabled: true}, Validators.required],
			ppnPOR: [{value: this.toRupiahString(this.paymentPo.payment.ppn), disabled: true}, Validators.required],
			pphPOR: [{value: this.toRupiahString(this.paymentPo.payment.pph), disabled: true}, Validators.required],
			discountValuePOR: [{value: this.toRupiahString(this.paymentPo.payment.discountValue), disabled: true}, Validators.required],
			shippingCostPOR: [{value: this.toRupiahString(this.paymentPo.payment.shippingCost), disabled: true}, Validators.required],
			discountNominal: [{value: "", disabled: false}],

			products: this.paymentPoFB.array([])
			// products: this.paymentPoFB.array(this.paymentPo.po_receipt.product.map(el => this.paymentPoFB.group(
			// 	{
			// 		product: new FormControl(el.product),
			// 		productCode: new FormControl(el.product.brand_code),
			// 		productName: new FormControl(el.product.brand_name),
			// 		price: new FormControl(el.price),
			// 		qty: new FormControl(el.qty),
			// 		subTotal: new FormControl(el.subTotal),
			// 		uom: new FormControl(el.uom),
			// 		uomName: new FormControl(el.uom.uom),
			// 		in_qty: new FormControl(el.in_qty),
			// 		in_price: new FormControl(el.in_price),
			// 	}
			// )))
		});

		this.productList = (this.paymentPoForm.get('products') as FormArray).controls

	}

	initAp() {
		//AP Form
		let objFormMultiGl = {}
		for (let i = 1; i <= 30; i++) {
			let glid, glacc, memo, amount, isDebit;
			if (this.ap.multiGLID[`glId${i}`] !== undefined) glid = this.ap.multiGLID[`glId${i}`]._id;
			if (this.ap.multiGLID[`glId${i}`] !== undefined) glacc = this.ap.multiGLID[`glId${i}`].acctName;
			if (this.ap.AP.multiGLAccount[`memo${i}`] !== undefined || this.ap.AP.multiGLAccount[`memo${i}`] !== undefined !== null) memo = this.ap.AP.multiGLAccount[`memo${i}`];
			if (this.ap.AP.multiGLAccount[`amount${i}`] !== undefined || this.ap.AP.multiGLAccount[`amount${i}`] !== null) amount = this.serviceFormat.rupiahFormatImprovement(this.ap.AP.multiGLAccount[`amount${i}`] == undefined || this.ap.AP.multiGLAccount[`amount${i}`] == null ? 0 : this.ap.AP.multiGLAccount[`amount${i}`]);
			if (this.ap.AP.multiGLAccount[`isDebit${i}`] !== undefined || this.ap.AP.multiGLAccount[`isDebit${i}`] !== null) isDebit = this.ap.AP.multiGLAccount[`isDebit${i}`];

			objFormMultiGl[`glAccountId${i}`] = [{ value: glid, disabled: true }];
			objFormMultiGl[`glAcc${i}`] = [{ value: glacc, disabled: true }];
			objFormMultiGl[`memo${i}`] = [{ value: memo, disabled: true }];
			objFormMultiGl[`amount${i}`] = [{ value: amount, disabled: true }];
			objFormMultiGl[`isDebit${i}`] = [{ value: isDebit, disabled: true }];
		}
		console.log(objFormMultiGl, 'objform multi')

		this.apForm = this.apFB.group({
			depositTo: [{value: this.ap.AP.depositTo, disabled: true}],
			voucherno: [{value: this.ap.AP.voucherno.toUpperCase(), disabled: true}, Validators.required],
			rate: [{ value: this.ap.AP.rate, disabled: true }], //number
			date: [{value: this.ap.AP.date, disabled: true}, Validators.required], // number
			createdBy: [{value:this.ap.AP.createdBy, disabled:true}, Validators.required],
			crtdate: [{ value: this.ap.AP.crtdate, disabled: true }], // number
			status: [{value: this.ap.AP.status, disabled: true}],
			paidFrom: [{ value: this.ap.AP.paidFrom.acctName, disabled: true }],
			multiGLAccount: this.apFB.group(objFormMultiGl),
			payTo: [{value: this.ap.AP.payTo, disabled: true}],
			payee: [{value: this.ap.AP.payee, disabled: true}],
			noAccount: [{value: this.ap.AP.noAccount, disabled: true}],
			bank: [{value: this.ap.AP.bank == null ? "" : this.ap.AP.bank._id, disabled: true}],
		});

		this.loadCOACashBank();
		this.loadGLAccountAP(null);
		this.loadBank()
	}

	ccList = [];

	getDataAP(){
		let id = this.paymentPo.ap._id
		if (id) {
			this.serviceAp.findApById(id).subscribe( resaccpurchase => {
				this.totalField = resaccpurchase.data.AP.totalField

				for (let i = 0; i < this.totalField; i++) {
					this.ccList.push({
						id: '',
						refCc: '',
						name: ''
					})
				}

				this.ap = resaccpurchase.data;


				if(resaccpurchase.data.AP.depositTo){
					this._filterCashbankList(
						`${resaccpurchase.data.AP.depositTo.acctName.toLocaleLowerCase()}`
					);
				}
				this._filterGLList(
					`${resaccpurchase.data.AP.glaccount.acctName.toLocaleLowerCase()}`
				);

				this.initAp()
			})

		}
	}

	goBackWithId() {
		const url = `/paymentPo`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshpaymentPo(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}
		url = `/paymentPo/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	// Product load

	getNumber(){
		this.loadingGenerate = true
		const controls = this.paymentPoForm.controls;
		//this.service.generatePRCode().subscribe(
		this.service.generatePRCode().subscribe(
			res => {
				// console.log(res.data);
				if (!this.paymentPo._id) {
					this.po_no = res.data;
					// controls.po_no.setValue(this.po_no)
				}
				this.loadingGenerate = false;
			}
		)
	}

	loadUom() {
		const queryParams = new QueryUomModel(
			null,
			'asc',
			'',
			1,
			10000
		);
		const addSubscription = this.serviceUom.getListUom(queryParams).subscribe(res => {
			this.uom = res.data
			this.uomFiltered = res.data
		})
	}

	loadQuo(){
		this.loadingQuo = true;
		this.selectionQuo.clear();
		const queryParams = new QueryQuotationModel(
			null,
			1,
			10000
		);
		if (this.paymentPo._id) {
			this.serviceQuo.getListQuotation(queryParams).subscribe(
				res => {
					// console.log(res);
					this.quoResult = res.data;
					this.loadingQuo = false;
					this.cd.markForCheck();
				}
			);
		} else {
		this.serviceQuo.getListSelQuotation(queryParams).subscribe(
			res => {
				// console.log(res);
				this.quoResult = res.data;
				this.loadingQuo = false
				this.cd.markForCheck();
				}
			);
		}
	}

	loadTax(){
				this.loadingTax = true;
				this.selectionTax.clear();
		const queryParams = new QueryTaxModel(
			null,
			1,
			10000
		);
		this.serviceTax.getListTax(queryParams).subscribe(
			res => {
				this.TaxResult = res.data;
				this.loadingTax = false;
				this.cd.markForCheck();
			}
		);
	}

	loadVendor(){
		this.loadingVendor = true;
		this.selectionVendor.clear();
		const queryParams = new QueryVendorModel(
			null,
			1,
			10000
		);
		this.serviceVendor.getListVendor(queryParams).subscribe(
			res => {

				this.VendorResult = res.data;
				this.VendorResultFiltered = res.data;
				
				this.loadingVendor = false;
				this.cd.markForCheck();
			}
		);
	}

	onSubmit(withBack: boolean = false) {

		//check ap validaation
		const valPaidFrom = this.apForm.controls.paidFrom.value
		this.glAccountValidation()
		if (this.invalid) {
			const message = `Complete contents of GlAccount`;
			this.layoutUtilsService.showActionNotification(
				message,
				MessageType.Create,
				5000,
				true,
				true)
			return
		}

		this.balancedValidation()
		if (!this.balanced) {
			this.layoutUtilsService.showActionNotification(
				"Amount is not Balanced",
				MessageType.Create,
				5000,
				true,
				true
			)
			return
		}

		if (typeof valPaidFrom == "object") {
			const message = `Paid From is required.`;
			this.layoutUtilsService.showActionNotification(
				message,
				MessageType.Create,
				5000,
				true,
				true)
			return
		}
		this.hasFormErrors = false;
		const controls = this.paymentPoForm.controls;
		//console.log(controls);
		if (this.paymentPoForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		// ap form validation
		if (this.apForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedpaymentPo = this.preparepaymentPo();

		// if (this.paymentPo._id) {
		// 	this.updatepaymentPo(editedpaymentPo, withBack);
		// 	return;
		// }
		this.addpaymentPo(editedpaymentPo, withBack);
	}

	// get productsArray() {
	// 	return this.paymentPoForm.controls['products'] as FormArray;
	//   }

	vendorchange(value){
		// console.log(value, "id vendor");

		this.paymentPoForm.controls.vendor_id.setValue(value)

		this.selectionVendor.clear();
		this.serviceVendor.findVendorById(value._id).subscribe(
			res => {
				// console.log(res, "data vendor id");
				let data = res.data;
				if (this.paymentPo._id) {
					this.paymentPoForm.controls.vendor_name.setValue(data._id)

				}
				//set product available for that vendor

				this.products = res.data.products
				this.ProductResultFiltered = res.data.products

				//if product from PR
				if(this.paymentPoForm.controls.typePO.value === "purchase_request"){
					this.products = this.products.filter(productVendor => this.productsListFromPR.some(productPR => productVendor._id === productPR._id ) );
					this.ProductResultFiltered = this.products
					let productsArray = this.paymentPoForm.controls['products'] as FormArray

					//remove old value
					while (productsArray.length !== 0) {
						productsArray.removeAt(0)
					  }

					this.productsListFromPR.map(el =>
						{
							//determine if product is available from vendor
							let isAvailable = this.products.some(productVendor => productVendor._id === el._id)

							productsArray.push(this.paymentPoFB.group({
								product: new FormControl(el._id),
								productName: new FormControl(el.product_name),
								price: new FormControl(),
								qty: new FormControl(el.qty),
								subTotal: new FormControl(),
								uom: new FormControl(el.uom),
								uomName: new FormControl(el.uom2),
								isNotAvailable: new FormControl(!isAvailable)
							})
							)
						} 
					)
					this.productList = (this.paymentPoForm.get('products') as FormArray).controls

					// this.table.renderRows();
					// this.productList
				}

				this.paymentPoForm.controls.vendorDesc.setValue(data.description)
				this.paymentPoForm.controls.vendorAddress.setValue(data.address)
			// this.changePOTotal()
			}
		);
	}

	taxchange(value){
		//console.log(value, "id tax");
		const controls = this.paymentPoForm.controls;

		this.selectionTax.clear();
		this.serviceTax.findTaxById(value).subscribe(
			res => {
				//console.log(res, "data tax id");
				//console.log(this.paymentPo._id);
				let data = res.data;
				controls.tax.setValue(data._id);
				// if (this.paymentPo._id) {
				// 	this.paymentPoForm.controls.tax.setValue(data._id)
				// }
				// this.changePOTotal()
			}
		);
	}

	preparepaymentPo() {
		try{

		const controls = this.paymentPoForm.controls;
		

		const _paymentPo = new PaymentPoModel();
		_paymentPo.clear();
		// _paymentPo._id = this.paymentPo._id;
		_paymentPo.purchase_invoice_no = controls.purchase_invoice_no.value;
		_paymentPo.createdBy = controls.created_by.value;
		_paymentPo.po_receipt = this.selectedPOR;
		_paymentPo.date = controls.date.value;
		_paymentPo.planned_payment_date = controls.planned_payment_date.value;
		_paymentPo.note = controls.notes.value;
		_paymentPo.payment = {
			subTotal: this.toRupiahNominal(controls.subTotalPOR.value),
			ppn: this.toRupiahNominal(controls.ppnPOR.value),
			pph: this.toRupiahNominal(controls.pphPOR.value),
			shippingCost: this.toRupiahNominal(controls.shippingCostPOR.value),
			discountValue: this.toRupiahNominal(controls.discountValuePOR.value),
			grandTotal: this.toRupiahNominal(controls.grandTotalPOR.value),
		}

		let apControls = this.apForm.controls
		let apData = this.apForm.value
		let objRes = {}
		for (let i = 2; i <= 30; i++) {
			const a = apControls.multiGLAccount.get(`amount${i}`).value
			let rupiah = a.replace(/[\.]+/g, "").replace(/[\,]+/g, ".");
			let rupiahNum = rupiah
			objRes[`glAcc${i}`] = apControls.multiGLAccount.get(`glAccountId${i}`).value;
			objRes[`memo${i}`] = apControls.multiGLAccount.get(`memo${i}`).value;
			objRes[`amount${i}`] = apControls.multiGLAccount.get(`amount${i}`).value == "" ? undefined : parseFloat(rupiahNum);
			objRes[`isDebit${i}`] = apControls.multiGLAccount.get(`amount${i}`).value == "" ? undefined : apControls.multiGLAccount.get(`isDebit${i}`).value
		}
		let rupiah = apControls.multiGLAccount.get('amount1').value.replace(/[\.]+/g, "").replace(/[\,]+/g, ".");
		let rupiahNum = rupiah
		apData = {
			...apData,
			totalField: this.totalField,
			glaccount: apControls.multiGLAccount.get('glAccountId1').value,
			amount: apControls.multiGLAccount.get('amount1').value == "" ? undefined : parseFloat(rupiahNum),
			memo: apControls.multiGLAccount.get('memo1').value,
			isDebit: apControls.multiGLAccount.get('amount1').value == "" ? undefined : apControls.multiGLAccount.get('isDebit1').value,
			multiGLAccount: objRes
		}
		_paymentPo.ap = apData;

		return _paymentPo;
		}
		catch(e){
			console.log(e, 'error')
		}
	}

	addpaymentPo( _paymentPo, withBack: boolean = false) {
		const addSubscription = this.service.createPaymentPo(_paymentPo).subscribe(
			res => {
				const message = `New purchase order successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/paymentPo`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding purchase order | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	updatepaymentPo(_paymentPo, withBack: boolean = false) {
		const addSubscription = this.service.updatePaymentPo(_paymentPo).subscribe(
			res => {
				const message = `Purchase order successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/paymentPo`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding purchase order | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getSubTotal(value) {
		let tempSubTotal = 0

		value.map(el =>
			{
				tempSubTotal += el.subTotal
			} 
		)
		return tempSubTotal
	}

	setSelectedPO(po) {
		this.selectedPO = po
	}

	poronChange(value){

		this.paymentPoForm.controls.po_receipt.setValue(value)
		this.paymentPoForm.controls.po_receipt_no.setValue(value.receipt_number)
		
		this.servicePOR.findPoReceiptById(value._id).subscribe(res => {

			//push POR into POR List
			this.selectedPOR.push(res.data)

			this.setSelectedPO(res.data.po)

			//filteronly on same PO
			this.PORResultFiltered = this.PORResult.filter(item => item.po._id === this.selectedPO._id)
			//filter again to check if already pick, dont show if already pick
			this.PORResultFiltered = this.PORResultFiltered.filter(item => !this.selectedPOR.some(itemB => itemB._id === item._id))

			this.reloadAllDataPOR()
		})

		// console.log(value, "purchase request");
		// this.selectionQuo.clear();
		// //this.servicePR.findPurchaseRequestById(value).subscribe(
		// this.serviceQuo.findQuotationById(value).subscribe(
		// 	res => {
		// 		let data = res.data;
		// 		//console.log(data, "-Quotation");
		// 		// console.log(this.paymentPo.product_name, "purchase order product");
		// 		const controls = this.paymentPoForm.controls;

		// 		//this.quotation_no = data.quotation_no;
		// 		if (this.paymentPo._id) {
		// 			//console.log("rhn1");
		// 			//console.log(this.paymentPo);
		// 			//controls.quo.setValue(data._id)
		// 			controls.quo.setValue(this.paymentPo.quo)
		// 			this.vendorchange(this.paymentPo.vendor_name._id)
		// 			if (this.paymentPo.tax != null)
		// 				this.taxchange(this.paymentPo.tax._id);

		// 			controls.total.setValue(this.paymentPo.total);
		// 			controls.grand_total.setValue(this.paymentPo.grand_total);

		// 			//this.loadProductList(this.paymentPo)
		// 			this.loadProductList(this.paymentPo.product_name);
		// 		} else {
		// 			//console.log("rhn2");
		// 			//console.log(data);
		// 			//console.log(data.vendor_name._id);
		// 			//this.paymentPoForm.controls.quotation_no.setValue(data.quotation_no)
		// 			controls.quo.setValue(data._id)
		// 			controls.vendor_name.setValue(data.vendor_name._id)
		// 			if (data.tax != null)
		// 				this.taxchange(data.tax);
		// 			controls.total.setValue(data.total);
		// 			controls.type_discount.setValue(data.type_discount);
		// 			controls.discount.setValue(data.discount);
		// 			controls.grand_total.setValue(data.grand_total);
		// 			this.loadProductList(data.product_name);
		// 		}
		// 		//this.changePOTotal()
		// 	}
		// );

	}

	reloadAllDataPOR() {

		//remove all product in product list
		let productsArray = this.paymentPoForm.controls['products'] as FormArray
		while (productsArray.length !== 0) {
			productsArray.removeAt(0)
		}

		let subTotalTempPOR = 0
		if(this.selectedPOR.length === 0) {
			this.paymentPoForm.controls.po_no.setValue("")
			this.paymentPoForm.controls.po.setValue("")

			this.paymentPoForm.controls.por_no.setValue("")
			this.paymentPoForm.controls.por.setValue("")
			
			this.paymentPoForm.controls.vendor_name.setValue("")
			
			this.paymentPoForm.controls.ppn.setValue("")
			this.paymentPoForm.controls.pph.setValue("")

			this.paymentPoForm.controls.term.setValue("")
			this.paymentPoForm.controls.termPeriod.setValue("")

			this.paymentPoForm.controls.discountType.setValue("")
			this.paymentPoForm.controls.discountValue.setValue("")
			this.paymentPoForm.controls.discountNominal.setValue("")

			this.paymentPoForm.controls.shippingCost.setValue("")
			this.paymentPoForm.controls.subTotalPOR.setValue("")

			//set subtotal temp for value tempsubtotal
			this.paymentPoForm.controls.subTotal.setValue("")
			this.paymentPoForm.controls.grandTotal.setValue("")
		}

		this.selectedPOR.forEach(value => {
			//set value for each form
			this.paymentPoForm.controls.po_no.setValue(value.po.po_no)
			this.paymentPoForm.controls.po.setValue(value.po)

			this.paymentPoForm.controls.por_no.setValue(value.receipt_number)
			this.paymentPoForm.controls.por.setValue(value)
			
			this.paymentPoForm.controls.vendor_name.setValue(value.po.vendor_name.vendor_name)
			
			this.paymentPoForm.controls.ppn.setValue(value.po.payment.ppn)
			this.paymentPoForm.controls.pph.setValue(value.po.payment.pph)

			this.paymentPoForm.controls.term.setValue(value.po.term.term)
			this.paymentPoForm.controls.termPeriod.setValue(value.po.term.termPeriod)

			this.paymentPoForm.controls.discountType.setValue(value.po.payment.discountType)
			this.paymentPoForm.controls.discountValue.setValue(value.po.payment.discountValue)
			this.paymentPoForm.controls.discountNominal.setValue(this.toRupiahString(value.po.payment.discountNominal))

			this.paymentPoForm.controls.shippingCost.setValue(value.po.payment.shippingCost)


			let productsArray = this.paymentPoForm.controls['products'] as FormArray
			// determine if product is available from vendor
			// while (productsArray.length !== 0) {
			// 	productsArray.removeAt(0)
			// }

			let tempSubTotal = 0
			let tempSubTotalPOR = 0

			value.product.map(el =>
				{
					tempSubTotal += el.subTotal
					tempSubTotalPOR += el.in_price

					productsArray.push(this.paymentPoFB.group({
						product: new FormControl(el._id),
						productCode: new FormControl(el.product.brand_code),
						productName: new FormControl(el.product.brand_name),
						price: new FormControl(el.price),
						qty: new FormControl(el.qty),
						subTotal: new FormControl(el.subTotal),
						uom: new FormControl(el.uom._id),
						uomName: new FormControl(el.uom.uom),
						in_qty: new FormControl(el.in_qty),
						in_price: new FormControl(el.in_price),
					})
					)
				} 
			)
			this.productList = (this.paymentPoForm.get('products') as FormArray).controls

			//set subtotal temp for value tempsubtotal
			this.paymentPoForm.controls.subTotal.setValue(tempSubTotal)
			this.paymentPoForm.controls.grandTotal.setValue(value.po.grand_total)
			
			subTotalTempPOR += tempSubTotalPOR
			this.paymentPoForm.controls.subTotalPOR.setValue(this.toRupiahString(subTotalTempPOR))

		})
		// this.table.renderRows();
	}

	loadProductList(value) {
		const controls = this.paymentPoForm.controls;
		this.loadingProduct = true;
		this.dataSource.next(value);
		this.productList
		controls.product_name.setValue(this.dataSource.value)
		// console.log(value.product_name);
		//this.changePOTotal()

		this.loadingProduct = false;
	}

	loadAllProductList() {
		const queryParams = new QueryQuotationModel(
			null,
			1,
			10000
		);
		const addSubscription = this.serviceProduct.getListProductBrand(queryParams).subscribe(res => {
			this.loadingProduct = true
			this.products = res.data

			this.ProductResultFiltered = res.data
			this.loadingProduct = false

		})
	}

	// decrease stock by id
	// decStock(_id){
	// 	// console.log(this.dataSource);
	// 	const controls = this.paymentPoForm.controls
	// 	let data = this.dataSource.getValue();
	// 	// console.log(_id);
	// 	let index = data.findIndex((item) => item._id == _id)
	// 	// console.log(data);
	// 	// console.log(index);
	// 	if (data[index].qty > 1) {
	// 		data[index].qty -= 1
	// 	}
	// 	data[index].subtotal = data[index].buy_price * data[index].qty
	// 	if (data[index].typediscount == "pr") {
	// 		// console.log(data[index].subtotal);
	// 		// console.log(data[index].discount);

	// 		let persen = (data[index].subtotal * data[index].discount) / 100;
	// 		// console.log(persen);
	// 		data[index].after_discount = data[index].subtotal - persen
	// 	} else {
	// 		data[index].after_discount = data[index].subtotal - data[index].discount
	// 	}



	// 	// if (data[index].qty > 1) {
	// 	// 	data[index].qty -= 1
	// 	// }
	// 	this.dataSource.next(data)
	// 	controls.product_name.setValue(data)
	// 	this.changePOTotal()
	// }

	// increase qty by id
	// intStock(_id, qty){
	// 	// console.log(_id);
	// 	const controls = this.paymentPoForm.controls
	// 	const data = this.dataSource.value;
	// 	let index = data.findIndex((item) => item._id == _id)
	// 	// console.log(data);
	// 	// console.log(index);
	// 	// console.log(qty, "qty datal indet");

	// 	if (qty !== undefined && qty > 0) {
	// 		data[index].qty = data[index].qty + qty
	// 	} else {
	// 		data[index].qty += 1
	// 	}
	// 	data[index].subtotal = data[index].buy_price * data[index].qty
	// 	if (data[index].typediscount == "pr") {
	// 		// console.log(data[index].subtotal);
	// 		// console.log(data[index].discount);

	// 		let persen = (data[index].subtotal * data[index].discount) / 100;
	// 		// console.log(persen);
	// 		data[index].after_discount = data[index].subtotal - persen
	// 	} else {
	// 		data[index].after_discount = data[index].subtotal - data[index].discount
	// 	}
	// 	this.dataSource.next(data)
	// 	controls.product_name.setValue(data)
	// 	this.cd.markForCheck()
	// 	this.changePOTotal()
	// }

	deleteProduct(_id){
		const controls = this.paymentPoForm.controls
		let data = this.dataSource.value;
		let index = data.findIndex((item) => item._id == _id)
		let removed = data.splice(index, index + 1)
		// console.log(removed);
		controls.product_name.setValue(data)
		this.dataSource.next(data)
		// this.changePOTotal()
	}

	// changePOTotal(){
	// 	const controls = this.paymentPoForm.controls
	// 	let data = this.dataSource.value
	// 	//console.log(data, "rhn3");
	// 	if (data.length > 0) {
	// 		let prices = data.map((item) => item.after_discount).reduce((a, b) => parseInt(a) + parseInt(b))
	// 		//let prices = data.map((item) => item.after_discount).reduce((a, b) => console.log(a) + console.log(b))
	// 		controls.total.setValue(prices)
	// 		//console.log(prices, "price po total");
	// 		this.changeTotal()
	// 	}
	// 	// else {
	// 	// 	const message = `Product list has not been updated`;
	// 	// 	this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
	// 	// }
	// }

	inputKeydownHandler(event) {
		return event.keyCode === 8 || event.keyCode === 46 ? true : !isNaN(Number(event.key));
	}

	// changeTotal(){
	// 	const controls = this.paymentPoForm.controls
	// 	let tax = 0
	// 	let taxamount = 0
	// 	this.selectionTax.clear();
	// 	if (controls.tax.value != "") {
	// 		this.serviceTax.findTaxById(controls.tax.value).subscribe(
	// 		res => {
	// 			// console.log(res, "purchase request");
	// 			let data = res.data
	// 			tax = data.nominal
	// 			// console.log(tax);
	// 			this.cd.markForCheck()


	// 		// console.log(tax, "tax");

	// 		let total = 0;
	// 		let totalamount = 0;
	// 		if (controls.type_discount.value == "pr") {
	// 			let persen = controls.total.value * controls.discount.value / 100
	// 			total = controls.total.value - persen;
	// 			taxamount = ((total * tax) / 100)
	// 			totalamount = total + taxamount

	// 			// console.log(taxamount, "taxamount");
	// 			//console.log(totalamount, "total amount1");
	// 			controls.grand_total.setValue(totalamount)
	// 		} else {
	// 			total = controls.total.value - controls.discount.value
	// 			taxamount = ((total * tax) / 100)
	// 			totalamount = total + taxamount
	// 			// console.log(taxamount, "taxamount");
	// 			//console.log(totalamount, "total amount2");
	// 			controls.grand_total.setValue(totalamount)
	// 		}
	// 	}
	// 	)}
	// 	else
	// 	{
	// 		let total = 0;
	// 		let totalamount = 0;
	// 		if (controls.type_discount.value == "pr") {
	// 			let persen = controls.total.value * controls.discount.value / 100
	// 			total = controls.total.value - persen;
	// 			taxamount = ((total * tax) / 100)
	// 			totalamount = total + taxamount

	// 			// console.log(taxamount, "taxamount");
	// 			//console.log(totalamount, "total amount1");
	// 			controls.grand_total.setValue(totalamount)
	// 		} else {
	// 			total = controls.total.value - controls.discount.value
	// 			taxamount = ((total * tax) / 100)
	// 			totalamount = total + taxamount
	// 			// console.log(taxamount, "taxamount");
	// 			//console.log(totalamount, "total amount2");
	// 			controls.grand_total.setValue(totalamount)
	// 		}
	// 	}


	// }

	// changeTotal(){
	// 	const controls = this.paymentPoForm.controls
	// 	let total;
	// 	if (controls.type_discount.value == "pr") {
	// 		let persen = controls.total.value * controls.discount.value / 100
	// 		total = controls.total.value - persen;
			// console.log(total, persen);

	// 		controls.grand_total.setValue(total)
	// 	} else {
	// 		total = controls.total.value - controls.discount.value
	// 		controls.grand_total.setValue(total)
	// 	}
	// }

	// editProduct(_id) {
	// 	let data = this.dataSource.value;
	// 	let dataExist = data.find((item) => item._id == _id)
	// 	let index = data.findIndex((item) => item._id == _id)
	// 	// let dataExist = data.find((item) => item.product_code == product_code)
	// 	if (dataExist && index >= 0) {
	// 		const dialogRef = this.dialog.open(PopupEditPaymentPo, {
	// 			data: dataExist,
	// 			maxWidth: '500px',
	// 			minHeight: '300px'
	// 		});
	// 		dialogRef.afterClosed().subscribe(result => {
	// 	if (result !== undefined) {
	// 		this.loadingProduct = true;
	// 		const controls = this.paymentPoForm.controls;
	// 			// console.log(result.data, "data edited");
	// 			data[index] = result.data;
	// 			// console.log(data);
	// 			this.dataSource.next(data);
	// 			controls.product_name.setValue(data)
	// 			this.changePOTotal()
	// 			this.loadingProduct = false;
	// 			this.cd.markForCheck()
	// 			}
	// 		})
	// 	}

	// }

	// viewProduct(_id){
	// 	// console.log(_id);

	// 	let data = this.dataSource.value;
	// 	let dataExist = data.find((item) => item._id == _id)
	// 	if (dataExist) {

	// 		const dialogRef = this.dialog.open(PopupViewPaymentPo, {
	// 			data: dataExist,
	// 			maxWidth: '500px',
	// 			minHeight: '300px'
	// 		});
	// 	}
	// }


	getComponentTitle() {
		let result = 'View PO Payment';

		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	loadPOR(){
		const queryParams = new QueryQuotationModel(
			null,
			1,
			10000
		);
		
		this.servicePOR.getListPoReceiptNumber(queryParams).subscribe(res => {
			this.loadingPOR = true
			this.PORResult = res.data
			this.PORResultFiltered = res.data
			this.loadingPOR = false
		})
	}

	filterPOR(e) {
		if(this.selectedPO){
			this.PORResultFiltered = this.PORResult.filter(item => item.receipt_number.includes(e.target.value) && item.po._id === this.selectedPO._id)
			//filter again to check if already pick, dont show if already pick
			this.PORResultFiltered = this.PORResultFiltered.filter(item => !this.selectedPOR.some(itemB => itemB._id === item._id))
		}
		else {
			this.PORResultFiltered = this.PORResult.filter(item => item.receipt_number.includes(e.target.value))
		}
	}

	filterVendor(e) {
		this.VendorResultFiltered = this.VendorResult.filter(item => item.vendor_name.includes(e.target.value))
	}

	filterProduct(e) {
		this.ProductResultFiltered = this.products.filter(item => item.brand_name.includes(e.target.value))
	}
	filterUom(e) {
		this.uomFiltered = this.uom.filter(item => item.uom.includes(e.target.value))
	}

	addProductToList(id){
		let productsArray = this.paymentPoForm.controls['products'] as FormArray
		productsArray.push(this.paymentPoFB.group({
			product: new FormControl(),
			productName: new FormControl(),
			price: new FormControl(),
			qty: new FormControl(),
			subTotal: new FormControl(),
			uom: new FormControl(),
			uomName: new FormControl(),
			isNotAvailable: new FormControl()
		})
		)

		this.cd.markForCheck()
		this.productList = (this.paymentPoForm.get('products') as FormArray).controls
		this.table.dataSource= this.productList
		this.table.renderRows();
	}

	removeProductFromList(id) {
		let productsArray = this.paymentPoForm.controls['products'] as FormArray
		productsArray.removeAt(id)
		this.productList = (this.paymentPoForm.get('products') as FormArray).controls

		this.cd.markForCheck()
		
		this.table.dataSource= this.productList
		this.table.renderRows();

	}

	onChangeProduct(e, id, prop) {
		let valueTarget
		let productsArray = this.paymentPoForm.controls['products'] as FormArray
		if(prop === 'product') valueTarget = {
			product: e._id,
			productName: e.brand_name
		}
		else if(prop === 'uom') valueTarget = {
			uom: e._id,
			uomName: e.uom
		}
		else valueTarget = {
			[prop]: e.target.value
		}
		// if(prop === 'product' || prop === 'uom') this.productList[id][prop] = e
		// else this.productList[id][prop] = e.target.value
		this.cd.markForCheck()

		productsArray.at(id).patchValue(valueTarget)
		this.productList = (this.paymentPoForm.get('products') as FormArray).controls

		// this.calculateGrandTotal()
	}

	typePOChange(value) {
		const control = this.paymentPoForm.controls

		control.typePO.setValue(value)
	}

	selectDocument(e) {
		this.cd.markForCheck()
		const files = (e.target as HTMLInputElement).files;
		this.selectedDocument = files
		for (let i = 0; i < files.length; i++) {
			// Skip uploading if file is already selected
			const alreadyIn = this.documents.filter(tFile => tFile.name === files[i].name).length > 0;
			if (alreadyIn) continue;

			this.documents.push(files[i]);
			let fileType = files[i].name.split(".").pop();
			if (fileType == "pdf") {
				this.isPreviewPdf = true;
			}
			else {
				this.isPreviewPdf = false
			}
			const reader = new FileReader();
			reader.onload = () => {
				this.documents = [{ name: files[i].name, url: reader.result }];
				this.cd.markForCheck();
			}
			reader.readAsDataURL(files[i]);
		}
		

	}

	removeSelectedDocument(item) {
		this.documents = this.documents.filter(i => i.name !== item.name);
		this.documents = this.documents.filter(i => i.url !== item.url);
		this.documentInputEl.nativeElement.value = "";

		this.cd.markForCheck();
	}

	calculateGrandTotal() {
		let control = this.paymentPoForm.controls

		// let tPrice = this.calculateTotalPrice()
		let tSubTotal = control.subTotalPOR.value? this.toRupiahNominal(control.subTotalPOR.value) : 0
		let tppn = control.ppnPOR.value? this.toRupiahNominal(control.ppnPOR.value) : 0
		let tpph = control.pphPOR.value? this.toRupiahNominal(control.pphPOR.value) : 0
		let tshipping = control.shippingCostPOR.value? this.toRupiahNominal(control.shippingCostPOR.value) : 0
		let tdiscount = control.discountValuePOR.value? this.toRupiahNominal(control.discountValuePOR.value) : 0
		let temp = tSubTotal + tppn - tpph + tshipping - tdiscount
		
		control.discountValuePOR.setValue(this.toRupiahString(control.discountValuePOR.value))
		control.subTotalPOR.setValue(this.toRupiahString(control.subTotalPOR.value))
		control.ppnPOR.setValue(this.toRupiahString(control.ppnPOR.value))
		control.pphPOR.setValue(this.toRupiahString(control.pphPOR.value))
		control.shippingCostPOR.setValue(this.toRupiahString(control.shippingCostPOR.value))
		control.grandTotalPOR.setValue(this.toRupiahString(temp))

	}

	calculateTotalPrice() {
		let temp = 0
		let productsArray = this.paymentPoForm.controls['products'] as FormArray

		productsArray.value.map(product => {
			temp = temp + parseInt(product.subTotal)
		})

		return temp
	}

	changeDiscountType(value) {
		let control = this.paymentPoForm.controls

		control.discountType.setValue(value)
	}

	changeTermPeriod(value) {
		let control = this.paymentPoForm.controls

		control.termPeriod.setValue(value)
	}

	_onKeyupPaidForm(e: any) {
		// this.topupForm.patchValue({ bank: _onKeyupPaidForm });
		this._filterPaidFormList(e.target.value);
	}

	_filterPaidFormList(text: string) {
		this.PaidFormResultFiltered = this.apResult.filter((i) => {
			const filterText = `${i.acctNo.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}

	loadCOACashBank() {
		this.loadingAp.deposit = true;
		this.selectionAp.clear();
		const queryParams = new QueryParamsModel(null, "asc", null, 1, 1000);
		this.COAService.getListCashBank(queryParams).subscribe((res) => {
			this.apResult = res.data;
			this.PaidFormResultFiltered = this.apResult;
			this.loadingAp.deposit = false;
			this.cd.markForCheck();
		});
	}

	loadGLAccountAP(text) {
		this.loadingAp.glaccount = true;
		this.selectionAp.clear();
		// const queryParams = new QueryParamsModel(null, "asc", null, 1, 10);
		const queryParams = new QueryParamsModel(text, "asc", null, 1, 10);

		this.COAService.getListGLAccountAP(queryParams).subscribe((res) => {
			const data = [];
			res.data.map((item) => {
				item.map((item2) => {
					data.push(item2);
				});
			});
			this.gLListResultFiltered = data.slice();
			this.viewGlResult.enable();
			this.viewGlResult2.enable();
			this.cd.markForCheck();
			this.loadingAp.deposit = false;

			this.glResult = data;
			this.loadingAp.glaccount = false;
			this.cd.markForCheck();
		});
	}

	loadBank() {
		this.selectionAp.clear();
		this.loadingAp.bank = true
		const queryParams = new QueryBankModel(null, "asc", null, 1, 1000);
		this.serviceBank.getListBank(queryParams).subscribe((res) => {
			this.bankResult = res.data;
			this.loadingAp.bank = false
		});
	}

	addCCEmpty() {
		this.ccList.push({
			id: '',
			refCc: '',
			name: ''
		});
		this.totalField = this.totalField += 1

		this.apTable.renderRows();

	}
	removeCC(i: number) {
		const controls = this.apForm.controls;
		this.ccList.splice(i, 1);

		const index = i + 1
		this.totalField = this.totalField -= 1
		controls.multiGLAccount.get(('glAcc' + index)).setValue("")
		controls.multiGLAccount.get(('amount' + index)).setValue("")
		controls.multiGLAccount.get(('glAccountId' + index)).setValue(undefined)
		controls.multiGLAccount.get(('memo' + index)).setValue(undefined)
		controls.multiGLAccount.get(('isDebit' + index)).setValue(true)

		this.apTable.renderRows();
	}

	addCC(e) {
		const controls = this.apForm.controls;
		let glRslt = controls.multiGLAccount.get(`glAccountId${e}`).value
		let amntRslt = controls.multiGLAccount.get(`amount${e}`).value
		if (glRslt == undefined || amntRslt == "") {
			const message = `Complete contents of GlAccount and amount No. ${e}`;
			this.layoutUtilsService.showActionNotification(
				message,
				MessageType.Create,
				5000,
				true,
				true)
			return
		}
		this.ccList.push({
			id: '',
			refCc: '',
			name: ''
		});
		this.totalField = this.totalField += 1

		this.apTable.renderRows();

	}

	_onKeyupGL(e: any) {
		this.apForm.patchValue({ glaccount: undefined });
		this._filterGLList(e.target.value);
	}

	_filterGLList(text: string) {

		this.loadGLAccountAP(text)
	}

	_setGLAccount(value, target) {
		const controls = this.apForm.controls;
		for (let i = 1; i <= 30; i++) {
			if (target == ('target' + i)) {
				controls.multiGLAccount.get(('glAcc' + i)).setValue(`${value.acctNo} - ${value.acctName}`)
				controls.multiGLAccount.get(('glAccountId' + i)).setValue(value._id)
			}
		}
	}

	// currency format
	changeAmount(event, id) {
		this.toCurrency(undefined, event, "amount", "amountClone", id);
	}

	toRupiahString(e) {
		try{

			let value
			if(typeof(e) === "number"){
				value = e.toString()
			}
		else value = e
		console.log(value)
		console.log(typeof(value))
		var number_string = value.replace(/[^.\d]/g, "").toString(),
			split = number_string.split("."),
			sisa = split[0].length % 3,
			rupiah = split[0].substr(0, sisa),
			ribuan = split[0].substr(sisa).match(/\d{3}/gi);
			
			// tambahkan koma jika yang di input sudah menjadi value ribuan
			let separator
			if (ribuan) {
				separator = sisa ? "," : "";
				rupiah += separator + ribuan.join(",");
		}
		
		rupiah = split[1] != undefined ? split[1][1] != undefined ? rupiah + "," + split[1][0] + split[1][1] : split[1] != '' ? rupiah + "," + split[1][0] : rupiah + "," + split[1] : rupiah;
		
		console.log(rupiah, 'rupiah')
		return rupiah
		}
		catch(error){
			return e
		}
	}

	toRupiahNominal(value) {
		try{
			let rupiah = value.replace(/[\,]+/g, "");

			return parseFloat(rupiah)
		}
		catch(e){
			return parseFloat(value)
		}
	}

	toCurrency(
		values: any,
		event: any,
		formName: string,
		rawValueProps: string,
		id
	) {
		// Differenciate function calls (from event or another function)
		let controls = this.apForm.controls;
		let value = event.target.value
		// controls.multiGLAccount.get(`amount${id}`).setValue(formattedNumber);

		var number_string = value.replace(/[^,\d]/g, "").toString(),
			split = number_string.split(","),
			sisa = split[0].length % 3,
			rupiah = split[0].substr(0, sisa),
			ribuan = split[0].substr(sisa).match(/\d{3}/gi);

		// tambahkan titik jika yang di input sudah menjadi value ribuan
		let separator
		if (ribuan) {
			separator = sisa ? "." : "";
			rupiah += separator + ribuan.join(".");
		}

		rupiah = split[1] != undefined ? split[1][1] != undefined ? rupiah + "," + split[1][0] + split[1][1] : split[1] != '' ? rupiah + "," + split[1][0] : rupiah + "," + split[1] : rupiah;
		controls.multiGLAccount.get(`amount${id}`).setValue(rupiah);

		return rupiah
	}

	valueIsDebit(e) {
		const controls = this.apForm.controls;
		for (let i = 1; i <= 30; i++) {
			let value = e.target.value == "true" ? true : false
			if (e.target.name == i) controls.multiGLAccount.get(('isDebit' + i)).setValue(value)
		}
		this.cd.markForCheck()
	}

	clickToggle(e) {
		const controls = this.apForm.controls;
		// for (let i = 1; i <= 30; i++) {
		// 	if (e.target.name == i) controls.multiGLAccount.get(('amount' + i)).setValue(null)
		// }
		this.cd.markForCheck()
	}

	_setPaidForm(value) {
		this.addPaidForm(value._id);
	}
	addPaidForm(value: string) {
		const controls = this.apForm.controls;
		this.apForm.controls.paidFrom.setValue(value);
	}

	glAccountValidation() {
		const controls = this.apForm.controls
		let list = []
		for (let i = 1; i <= this.totalField; i++) {
			let gl = controls.multiGLAccount.get(`glAccountId${i}`).value
			list.push(gl != undefined)
		}
		this.invalid = list.some(item => item == false)
	}
	balancedValidation() {
		const controls = this.apForm.controls
		let totalAllDebit = 0
		let totalAllCredit = 0
		let resultIsDebit = []
		let resultIsCredit = []
		for (let i = 1; i <= this.totalField; i++) {
			if (controls.multiGLAccount.get(`isDebit${i}`).value == true) {
				resultIsDebit.push({ amount: this.serviceFormat.formatFloat(controls.multiGLAccount.get(`amount${i}`).value), no: i })
			} else {
				resultIsCredit.push({ amount: this.serviceFormat.formatFloat(controls.multiGLAccount.get(`amount${i}`).value), no: i })
			}
		}

		resultIsDebit.forEach(data => totalAllDebit += data.amount)
		resultIsCredit.forEach(data => totalAllCredit += data.amount)
		if (totalAllDebit == totalAllCredit) {
			this.balanced = true
		} else {
			this.balanced = false
		}
	}
	_filterCashbankList(text: string) {
		this.apListResultFiltered = this.apResult.filter((i) => {
			const filterText = `${i.acctNo.toLocaleLowerCase()}`;
			if (filterText.includes(text.toLocaleLowerCase())) return i;
		});
	}
	valueChecked(choose) {
		for (let i = 1; i <= 30; i++) {
			let valIsDeb
			if (this.ap.AP.multiGLAccount[`isDebit${i}`] != undefined) valIsDeb = this.ap.AP.multiGLAccount[`isDebit${i}`];
			else valIsDeb = true

			if (choose == ('deb' + i)) return valIsDeb;
			else if (choose == ('cred' + i)) return !valIsDeb
		}
	}
	onChangePORAmount(event, type) {
		this.calculateGrandTotal()
	}

	deleteSelectedPOR(item) {
		this.selectedPOR = this.selectedPOR.filter(i => {
			if(i._id != item._id) return i
		})

		this.reloadAllDataPOR()

		this.cd.markForCheck()
	}
}
