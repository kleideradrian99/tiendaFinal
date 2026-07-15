import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from 'src/app/services/admin.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { NgIf, NgFor, DatePipe, CurrencyPipe } from '@angular/common';

@Component({
    selector: 'app-detalle-ventas',
    templateUrl: './detalle-ventas.component.html',
    styleUrls: ['./detalle-ventas.component.css'],
    imports: [SidebarComponent, NgIf, NgFor, DatePipe, CurrencyPipe]
})
export class DetalleVentasComponent implements OnInit {

  public url;
  public token;
  public orden: any = {};
  public detalles: Array<any> = [];
  public load_data = true;
  public id;

  public totalstar = 5;

  public review: any = {};

  constructor(
    private _route: ActivatedRoute,
    private _adminService: AdminService
  ) {
    this.token = localStorage.getItem('token');
    this.url = GLOBAL.url;
    this._route.params.subscribe(
      params => {
        this.id = params['id'];

        this.init_data();
      }
    );
  }

  ngOnInit(): void {
  }

  init_data() {
    this._adminService.obtener_detalles_ordenes_cliente(this.id, this.token).subscribe(
      response => {
        if (response.data != undefined) {
          this.orden = response.data;

          this.detalles = response.detalles;
          this.load_data = false;
        } else {
          this.orden = undefined;
        }

      }
    );
  }

}
