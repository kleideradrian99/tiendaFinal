import { Component, OnInit } from '@angular/core';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { AdminService } from 'src/app/services/admin.service';
import { ClienteService } from 'src/app/services/cliente.service';
import { ProductoService } from 'src/app/services/producto.service';

declare var iziToast;
declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-create-pedido',
  templateUrl: './create-pedido.component.html',
  styleUrls: ['./create-pedido.component.css']
})
export class CreatePedidoComponent implements OnInit {

  public clientes: Array<any> = [];
  public cliente: any = {
    genero: ''
  };

  public load_data = true;
  public token;
  public load_btn = false;
  public filtro = '';

  public file: File = undefined;
  public imgSelect: any | ArrayBuffer = 'assets/img/01.jpg';
  public config_global: any = {};

  // PRODUCTO
  public page = 1;
  public pageSize = 4;
  public url;
  public producto: any = {};
  public productos: Array<any> = [];
  public arr_productos: Array<any> = [];
  public cal_total;

  constructor(
    private _adminService: AdminService,
    private _clienteService: ClienteService,
    private _productoService: ProductoService
  ) {
    this.token = this._adminService.getToken();
    this.url = GLOBAL.url;
    this._adminService.obtener_config_publico().subscribe(
      response => {
        this.config_global = response.data;
      }
    );
  }

  ngOnInit(): void {
    this.init_Data();
  }

  init_Data() {
    //Cargamos los clientes en BD
    this._clienteService.listar_clientes_filtro_admin(null, null, this.token).subscribe(
      response => {
        this.clientes = response.data;
        this.load_data = false;
        console.log("Estos son los clientes " + this.clientes)
      },
      error => {
        console.log(error);
      }
    );
    // Cargamos los productos
    this._productoService.listar_productos_admin(this.filtro, this.token).subscribe(
      response => {
        // console.log(response);
        this.productos = response.data;
        this.productos.forEach(element => {
          this.arr_productos.push({
            titulo: element.titulo,
            stock: element.stock,
            precio: element.precio,
            categoria: element.categoria,
            nventas: element.nventas
          });
        });
        console.log(this.arr_productos);
        this.load_data = false;
      },
      error => {
        console.log(error);

      }
    )
  }

  calcularTotal(precio, cantidad) {
    this.cal_total = precio * cantidad;
    this.producto.total = this.cal_total;
  }

  registro(registroForm) {

  }
  // Cliente
  filtrar() {
    if (this.filtro) {
      this._clienteService.obtener_cliente(this.filtro, this.token).subscribe(
        response => {
          this.productos = response.data;
          console.log(this.productos);
        }
      )
    } else {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Ingrese un filtro para buscar'
      });
    }
  }

  // PRODUCTO
  filtrarProducto() {

  }

  resetar() { }

  eliminar(id) { }

}
