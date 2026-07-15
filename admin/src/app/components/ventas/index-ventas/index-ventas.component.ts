import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { NgFor, SlicePipe, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterLinkActive, RouterLink } from '@angular/router';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-index-ventas',
    templateUrl: './index-ventas.component.html',
    styleUrls: ['./index-ventas.component.css'],
    imports: [SidebarComponent, FormsModule, NgFor, RouterLinkActive, RouterLink, NgbPagination, SlicePipe, DatePipe, CurrencyPipe]
})
export class IndexVentasComponent implements OnInit {

  public token;
  public desde;
  public hasta;

  public ventas : Array<any>=[];
  public page = 1;
  public pageSize = 15;

  constructor(
    private _adminService:AdminService
  ) { 
    this.token = localStorage.getItem('token');
  }

  ngOnInit(): void {
    this._adminService.obtener_ventas_admin(this.desde,this.hasta,this.token).subscribe(
      response=>{

        this.ventas = response.data;
      }
    );
  }

  filtrar(){
    this._adminService.obtener_ventas_admin(this.desde,this.hasta,this.token).subscribe(
      response=>{

        this.ventas = response.data;
      }
    );
  }

}
