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

  public carrito_data: any = {
    variedad: '',
    cantidad: 0
  };

  // CLIENTE
  public clientes: Array<any> = [];
  public cliente: any = {};
  public filtroCliente = '';
  public _idCliente = '';

  public load_data = true;
  public token;
  public load_btn = false;
  public filtro = '';

  public file: File = undefined;
  public imgSelect: any | ArrayBuffer = 'assets/img/01.jpg';
  public config_global: any = {};

  //CARRITO PEDIDO
  public carrito_arr: Array<any> = [];
  public venta: any = {};
  public dventa: Array<any> = [];
  public page2 = 1;
  public pageSize2 = 4;

  // PRODUCTO
  public page = 1;
  public pageSize = 4;
  public url;
  public btn_cart = false;
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
    // Variedades

  }

  ngOnInit(): void {
    this.init_Data();
  }

  init_Data() {
    this._productoService.listar_productos_admin(this.filtro, this.token).subscribe(
      response => {
        this.productos = response.data;
        this.productos.forEach(element => {
          this.arr_productos.push({
            titulo: element.titulo,
            _id: element._id,
            stock: element.stock,
            precio: element.precio,
            categoria: element.categoria,
            nventas: element.nventas,
            variedades: element.variedades,
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
          if (response.data == "") {
            this.clientes = undefined;
          } else {
            this.clientes = response.data;
            this._idCliente = response.data[0]._id;
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

  //CARRITO
  obtenerPedidoCliente() {
    if (this._idCliente != '') {
      this._clienteService.obtener_carrito_cliente(this._idCliente, this.token).subscribe(
        response => {
          this.carrito_arr = response.data;
          console.log(this.carrito_arr);
          this.carrito_arr.forEach(element => {
            this.dventa.push({
              producto: element.producto._id,
              subtotal: element.producto.precio,
              variedad: element.variedad,
              cantidad: element.cantidad,
              cliente: this._idCliente
            });
          });
        }
      );
    } else {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Aun no ha seleccionado un cliente'
      });
    }
  }


  agregar_producto(producto, id) {
    //PENDIENTE SABER STOCK SHOW-PRODUCTO
    if (this._idCliente != '') {
      if (this.carrito_data.variedad) {
        let data = {
          producto: producto._id,
          cliente: this._idCliente,
          cantidad: this.carrito_data.cantidad,
          variedad: this.carrito_data.variedad,
        }
        this.btn_cart = true;
        setTimeout(() => {
          this._clienteService.agregar_carrito_cliente(data, this.token).subscribe(
            response => {
              if (response.data == undefined) {
                iziToast.show({
                  title: 'ERROR',
                  titleColor: '#FF0000',
                  color: '#FFF',
                  class: 'text-danger',
                  position: 'topRight',
                  message: 'El producto ya existe en el Pedido'
                });
                this.btn_cart = false;
              } else {
                console.log(response);
                iziToast.show({
                  title: 'SUCCESS',
                  titleColor: '#1DC74C',
                  color: '#FFF',
                  class: 'text-success',
                  position: 'topRight',
                  message: 'Se agregó el producto al Pedido.'
                });
                this.btn_cart = false;
                $('#select-' + id).modal('hide');
                $('.modal-backdrop').removeClass('show');
                //this.init_Data();
              }
            }
          );
        }, 2000);
      } else {
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: 'Seleccione una variedad de producto'
        });
      }
    } else {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Debe ingresar un cliente para continuar'
      });
    }
  }

  // PRODUCTO
  filtrarProducto() {
    if (this.filtro) {
      this._productoService.listar_productos_admin(this.filtro, this.token).subscribe(
        response => {
          // console.log(response);
          this.productos = response.data;
          this.load_data = false;
        },
        error => {
          console.log(error);

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

  resetar() {
    this.filtro = '';
    this.init_Data();
  }

  eliminar(id) { }

}
