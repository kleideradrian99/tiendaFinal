import { Component, OnInit } from '@angular/core';

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

  constructor() { }

  ngOnInit(): void {
  }

  filtrar(){
    // this._cuponService.listar_cupones_admin(this.filtro,this.token).subscribe(
    //   response=>{
    //     this.cupones = response.data;
    //     this.load_data = false;
    //   }
    // )
  }

}
