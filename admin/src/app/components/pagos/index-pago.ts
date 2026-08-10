import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NgFor, NgIf, DatePipe, CurrencyPipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PagoService } from 'src/app/services/pago.service';
import { AdminService } from 'src/app/services/admin.service';
import { GLOBAL } from 'src/app/services/GLOBAL';

declare var iziToast;

@Component({
  selector: 'app-index-pago',
  templateUrl: './index-pago.html',
  styleUrls: ['./index-pago.css'],
  imports: [SidebarComponent, NgFor, NgIf, DatePipe, CurrencyPipe, NgClass, FormsModule, RouterLink]
})
export class IndexPago implements OnInit {
  public token;
  public url;
  public load_data = true;
  public comprobantes: Array<any> = [];
  public comprobantes_filtrados: Array<any> = [];
  
  public filtro_estado = 'Todos';
  public comprobante_seleccionado: any = undefined;
  
  public btn_load = false;
  public eval_data = {
    estado: 'Aprobado',
    observaciones: ''
  };

  constructor(
    private _pagoService: PagoService,
    private _adminService: AdminService
  ) {
    this.token = this._adminService.getToken();
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    if (this.token) {
      this.init_data();
    }
  }

  init_data() {
    this.load_data = true;
    this._pagoService.listar_comprobantes_admin('', this.token).subscribe(
      response => {
        this.comprobantes = response.data || [];
        this.filtrar_comprobantes();
        this.load_data = false;
      },
      error => {
        console.error(error);
        this.load_data = false;
      }
    );
  }

  filtrar_comprobantes() {
    if (this.filtro_estado === 'Todos') {
      this.comprobantes_filtrados = this.comprobantes;
    } else {
      this.comprobantes_filtrados = this.comprobantes.filter(item => item.estado === this.filtro_estado);
    }
  }

  seleccionar_comprobante(item) {
    this.comprobante_seleccionado = item;
    this.eval_data = {
      estado: 'Aprobado',
      observaciones: ''
    };
  }

  cerrar_detalle() {
    this.comprobante_seleccionado = undefined;
  }

  evaluar_comprobante() {
    if (!this.eval_data.estado) {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Seleccione una decisión (Aprobado o Rechazado).'
      });
      return;
    }

    if (this.eval_data.estado === 'Rechazado' && !this.eval_data.observaciones) {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Debe ingresar un motivo de rechazo en las observaciones.'
      });
      return;
    }

    this.btn_load = true;
    this._pagoService.evaluar_comprobante_admin(this.comprobante_seleccionado._id, this.eval_data, this.token).subscribe(
      response => {
        iziToast.show({
          title: 'ÉXITO',
          titleColor: '#1DC74C',
          color: '#FFF',
          class: 'text-success',
          position: 'topRight',
          message: 'El comprobante ha sido evaluado con éxito.'
        });
        this.btn_load = false;
        this.comprobante_seleccionado = undefined;
        this.init_data();
      },
      error => {
        console.error(error);
        this.btn_load = false;
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: 'Error al evaluar el comprobante.'
        });
      }
    );
  }
}
