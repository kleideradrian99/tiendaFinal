import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NgIf, NgFor, SlicePipe, DatePipe, NgClass, CurrencyPipe, DecimalPipe } from '@angular/common';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

declare var iziToast;

@Component({
  selector: 'app-index-finanzas',
  templateUrl: './index-finanzas.html',
  styleUrls: ['./index-finanzas.css'],
  imports: [SidebarComponent, NgIf, NgFor, NgbPagination, SlicePipe, DatePipe, FormsModule, NgClass, CurrencyPipe, DecimalPipe, RouterLink]
})
export class IndexFinanzasComponent implements OnInit {
  public token;
  public tiene_acceso = false;
  
  public load_data = true;
  public page = 1;
  public pageSize = 20;
  
  public desde = '';
  public hasta = '';
  
  public ventas: Array<any> = [];
  public aggregates: any = {
    total_ingresos: 0,
    total_confeccion: 0,
    total_comisiones_pasarela: 0,
    total_comisiones_asesora: 0,
    total_envio: 0,
    total_utilidad_neta: 0
  };

  // Variable para edición rápida de TRM en modal
  public pedido_edit_trm: any = null;
  public nueva_trm = 4000;
  public load_btn = false;

  constructor(private _adminService: AdminService) {
    this.token = localStorage.getItem('token');
  }

  ngOnInit(): void {
    if (this.token) {
      const decoded = this.decodeToken(this.token);
      const role = decoded ? decoded.role : null;
      if (['admin', 'finanzas', 'direccion'].includes(role)) {
        this.tiene_acceso = true;
        this.init_data();
      } else {
        this.tiene_acceso = false;
        this.load_data = false;
      }
    } else {
      this.tiene_acceso = false;
      this.load_data = false;
    }
  }

  decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(payload));
    } catch (e) {
      return null;
    }
  }

  init_data() {
    this.load_data = true;
    this._adminService.obtener_balance_financiero_admin(this.desde || undefined, this.hasta || undefined, this.token).subscribe(
      response => {
        this.ventas = response.data || [];
        this.aggregates = response.aggregates || {
          total_ingresos: 0,
          total_confeccion: 0,
          total_comisiones_pasarela: 0,
          total_comisiones_asesora: 0,
          total_envio: 0,
          total_utilidad_neta: 0
        };
        this.load_data = false;
      },
      error => {
        console.error(error);
        this.load_data = false;
      }
    );
  }

  filtrar() {
    this.init_data();
  }

  limpiar_filtros() {
    this.desde = '';
    this.hasta = '';
    this.init_data();
  }

  abrir_modal_trm(item) {
    this.pedido_edit_trm = item;
    this.nueva_trm = item.trm_aplicada || 4000;
  }

  guardar_trm() {
    if (!this.nueva_trm || this.nueva_trm <= 0) {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Ingrese una TRM válida superior a cero.'
      });
      return;
    }

    this.load_btn = true;
    this._adminService.actualizar_trm_pedido_admin(this.pedido_edit_trm._id, { trm_aplicada: this.nueva_trm }, this.token).subscribe(
      response => {
        iziToast.show({
          title: 'ÉXITO',
          titleColor: '#1DC74C',
          color: '#FFF',
          class: 'text-success',
          position: 'topRight',
          message: 'TRM del pedido actualizada.'
        });
        this.pedido_edit_trm = null;
        this.load_btn = false;
        this.init_data();
      },
      error => {
        this.load_btn = false;
        console.error(error);
      }
    );
  }
}
