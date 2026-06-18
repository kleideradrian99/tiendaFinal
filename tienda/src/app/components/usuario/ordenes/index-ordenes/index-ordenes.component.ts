import { Component, OnInit } from '@angular/core';
import { ClienteService } from 'src/app/services/cliente.service';
import { NavComponent } from '../../../nav/nav.component';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SiderbarComponent } from '../../siderbar/siderbar.component';
import { NgIf, NgFor, SlicePipe, DatePipe } from '@angular/common';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { FooterComponent } from '../../../footer/footer.component';

@Component({
    selector: 'app-index-ordenes',
    templateUrl: './index-ordenes.component.html',
    styleUrls: ['./index-ordenes.component.css'],
    imports: [NavComponent, RouterLink, SiderbarComponent, NgIf, NgFor, RouterLinkActive, NgbPagination, FooterComponent, SlicePipe, DatePipe]
})
export class IndexOrdenesComponent implements OnInit {

  public url;
  public token;
  public ordenes : Array<any> = [];
  public load_data = true;
  public user : any = {};

  public page = 1;
  public pageSize = 15;

  constructor(
    private _clienteService:ClienteService
  ) { 
    this.token = localStorage.getItem('token');
  }

  ngOnInit(): void {
    this.init_data();
  }

  init_data(){
    this._clienteService.obtener_ordenes_cliente(localStorage.getItem('_id'),this.token).subscribe(
      response=>{
        this.ordenes = response.data;
        this.load_data =false;
      }
    );
  }

}
