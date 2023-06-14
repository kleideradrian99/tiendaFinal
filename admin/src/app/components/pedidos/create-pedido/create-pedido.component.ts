import { Component, OnInit } from '@angular/core';
import { element } from 'protractor';
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

  // CLIENTE
  public clientes: Array<any> = [];
  public cliente: any = {};
  public filtroCliente = '';

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
    // this._clienteService.listar_clientes_filtro_admin(null, null, this.token).subscribe(
    //   response => {
    //     this.clientes = response.data;
    //     this.load_data = false;
    //   },
    //   error => {
    //     console.log(error);
    //   }
    // );
    // Cargamos los productos
    this._productoService.listar_productos_admin(this.filtro, this.token).subscribe(
      response => {
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
  filtrarCliente() {
    if (this.filtroCliente) {
      this._clienteService.obtener_cliente(this.filtroCliente, this.token).subscribe(
        response => {
          if (response.data == undefined) {
            this.clientes = undefined;
          } else {
            this.clientes = response.data;
          }
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
      this.clientes = undefined;
    }
  }

  // PRODUCTO
  filtrarProducto() {

  }

  resetar() { }

  eliminar(id) { }

}
