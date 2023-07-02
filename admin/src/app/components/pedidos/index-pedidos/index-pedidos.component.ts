import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { ClienteService } from 'src/app/services/cliente.service';

@Component({
  selector: 'app-index-pedidos',
  templateUrl: './index-pedidos.component.html',
  styleUrls: ['./index-pedidos.component.css']
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
      response=>{
        console.log(response);
      }
    );
  }

  filtrar() {

  }

}
