import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { ClienteService } from 'src/app/services/cliente.service';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, SlicePipe } from '@angular/common';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-index-pedidos',
    templateUrl: './index-pedidos.component.html',
    styleUrls: ['./index-pedidos.component.css'],
    imports: [SidebarComponent, RouterLink, FormsModule, NgIf, NgFor, NgbPagination, SlicePipe]
})
export class IndexPedidosComponent implements OnInit {

  public cupones: Array<any> = [];
  public load_data = false;
  public page = 1;
  public pageSize = 20;
  public filtro = '';
  public token;

  constructor(
    private _clienteService: ClienteService,
    private _adminService: AdminService,
  ) {
    this.token = this._adminService.getToken();

  }

  ngOnInit(): void {
    this._clienteService.obtener_ordenes(this.token).subscribe(
      response => {
      }
    );
  }

  filtrar() {

  }

}
