import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NgFor, NgIf, DatePipe, CurrencyPipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProformaService } from 'src/app/services/proforma.service';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-index-proforma',
  templateUrl: './index-proforma.html',
  imports: [SidebarComponent, NgFor, NgIf, DatePipe, CurrencyPipe, RouterLink, NgClass]
})
export class IndexProforma implements OnInit {
  public token;
  public load_data = true;
  public proformas: Array<any> = [];

  constructor(
    private _proformaService: ProformaService,
    private _adminService: AdminService
  ) {
    this.token = this._adminService.getToken();
  }

  ngOnInit(): void {
    this.init_data();
  }

  init_data() {
    this.load_data = true;
    this._proformaService.listar_proformas_admin(this.token).subscribe(
      response => {
        this.proformas = response.data || [];
        this.load_data = false;
      },
      error => {
        console.error(error);
        this.load_data = false;
      }
    );
  }
}
