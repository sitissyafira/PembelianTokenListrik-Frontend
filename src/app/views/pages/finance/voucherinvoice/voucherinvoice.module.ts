import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoucherinvoiceComponent } from './voucherinvoice.component';
import { ListVoucherinvoiceComponent } from './list-voucherinvoice/list-voucherinvoice.component';



@NgModule({
  declarations: [VoucherinvoiceComponent, ListVoucherinvoiceComponent],
  imports: [
    CommonModule
  ]
})
export class VoucherinvoiceModule { }
