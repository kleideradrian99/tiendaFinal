import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NgFor, NgIf, DatePipe, CurrencyPipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProformaService } from 'src/app/services/proforma.service';
import { AdminService } from 'src/app/services/admin.service';
import { GLOBAL } from 'src/app/services/GLOBAL';

declare var iziToast;

@Component({
  selector: 'app-detail-proforma',
  templateUrl: './detail-proforma.html',
  imports: [SidebarComponent, NgFor, NgIf, DatePipe, CurrencyPipe, FormsModule, RouterLink, NgClass]
})
export class DetailProforma implements OnInit {
  public id;
  public token;
  public url;
  public load_data = true;
  public load_btn = false;
  public proforma: any = {};

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _proformaService: ProformaService,
    private _adminService: AdminService
  ) {
    this.token = this._adminService.getToken();
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      this.id = params['id'];
      this.init_data();
    });
  }

  init_data() {
    this.load_data = true;
    this._proformaService.obtener_proforma_admin(this.id, this.token).subscribe(
      response => {
        if (response.data) {
          this.proforma = response.data;
        } else {
          this.proforma = undefined;
        }
        this.load_data = false;
      },
      error => {
        console.error(error);
        this.load_data = false;
      }
    );
  }

  recalcular() {
    let subtotal = 0;
    this.proforma.detalles.forEach(item => {
      item.subtotal = item.cantidad * item.precio_unitario;
      subtotal += item.subtotal;
    });
    this.proforma.subtotal = subtotal;
    this.proforma.total = this.proforma.subtotal + (parseFloat(this.proforma.envio_precio) || 0) + (parseFloat(this.proforma.impuestos) || 0);
  }

  actualizar() {
    this.load_btn = true;
    // Asegurarse de recalcular los totales antes de enviar
    this.recalcular();

    this._proformaService.actualizar_proforma_admin(this.id, this.proforma, this.token).subscribe(
      response => {
        iziToast.show({
          title: 'ÉXITO',
          titleColor: '#1DC74C',
          color: '#FFF',
          class: 'text-success',
          position: 'topRight',
          message: 'Se actualizó y guardó la proforma correctamente.'
        });
        this.load_btn = false;
        this.init_data();
      },
      error => {
        console.error(error);
        this.load_btn = false;
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: 'No se pudo guardar la proforma.'
        });
      }
    );
  }
}
