import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { ClienteService } from 'src/app/services/cliente.service';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, SlicePipe, DatePipe, NgClass } from '@angular/common';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';

declare var iziToast: any;

@Component({
    selector: 'app-index-pedidos',
    templateUrl: './index-pedidos.component.html',
    styleUrls: ['./index-pedidos.component.css'],
    imports: [SidebarComponent, RouterLink, FormsModule, NgIf, NgFor, NgbPagination, SlicePipe, DatePipe, NgClass]
})
export class IndexPedidosComponent implements OnInit {

  public ventas: Array<any> = [];
  public ventas_const: Array<any> = [];
  public load_data = true;
  public page = 1;
  public pageSize = 20;
  public filtro = '';
  public token;

  constructor(
    private _adminService: AdminService,
  ) {
    this.token = this._adminService.getToken();
  }

  ngOnInit(): void {
    this.init_data();
  }

  init_data() {
    this.load_data = true;
    this._adminService.obtener_ventas_admin('undefined', 'undefined', this.token).subscribe(
      response => {
        this.ventas = response.data || [];
        this.ventas_const = this.ventas;
        this.load_data = false;
      },
      error => {
        console.log(error);
        this.load_data = false;
      }
    );
  }

  filtrar() {
    if (this.filtro) {
      const term = new RegExp(this.filtro, 'i');
      this.ventas = this.ventas_const.filter(item => {
        return term.test(item.nventa) || 
               (item.cliente && term.test(item.cliente.nombres)) || 
               (item.cliente && term.test(item.cliente.apellidos)) ||
               (item.cliente && term.test(item.cliente.email)) ||
               (item._id && term.test(item._id));
      });
    } else {
      this.ventas = this.ventas_const;
    }
  }

  actualizar_estado(id: string, nuevoEstado: string) {
    this._adminService.actualizar_estado_venta_admin(id, { estado: nuevoEstado }, this.token).subscribe(
      response => {
        iziToast.show({
          title: 'SUCCESS',
          titleColor: '#1DC74C',
          color: '#FFF',
          class: 'text-success',
          position: 'topRight',
          message: 'Estado actualizado correctamente.'
        });
        this.init_data();
      },
      error => {
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: 'Error al actualizar el estado del pedido.'
        });
        console.log(error);
      }
    );
  }
}
