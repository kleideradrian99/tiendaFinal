import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ClienteService } from 'src/app/services/cliente.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { io } from "socket.io-client";
import { GuestService } from 'src/app/services/guest.service';
import { Router } from '@angular/router';
declare var iziToast;
declare var Cleave;
declare var StickySidebar;
declare var paypal;

interface HtmlInputEvent extends Event{
  target : HTMLInputElement & EventTarget;
} 

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {
  @ViewChild('paypalButton',{static:true}) paypalElement : ElementRef;
  public idcliente;
  public token;

  public carrito_arr : Array<any> = [];
  public url;
  public subtotal = 0;
  public total_pagar : any = 0;
  public socket = io('http://localhost:4201');
 
  public direccion_principal : any = {};
  public envios : Array<any>=[];

  public precio_envio = "0";

  public venta : any = {};
  public dventa : Array<any> = [];
  public card_data : any = {};
  public btn_load = false;
  public carrito_load = true;

  public user : any = {};
  public descuento = 0;
  public error_cupon = '';

  public descuento_activo : any = undefined;

  constructor(
    private _clienteService:ClienteService,
    private _guestService:GuestService,
    private _router:Router
  ) { 

    this.idcliente = localStorage.getItem('_id');
    this.venta.cliente = this.idcliente;
    this.token = localStorage.getItem('token');
    this.url =GLOBAL.url;
    

    this._guestService.get_Envios().subscribe(
      response=>{
        this.envios = response;

      }
    );

    this.user = JSON.parse(localStorage.getItem('user_data'));
  }

  ngOnInit(): void {

    this._guestService.obtener_descuento_activo().subscribe(
      response=>{
        if(response.data != undefined){
          this.descuento_activo = response.data[0];
        }else{
          this.descuento_activo = undefined;
        }

      }
    );
  

    this.init_Data();
    setTimeout(()=>{
      new Cleave('#cc-number', {
          creditCard: true,
            onCreditCardTypeChanged: function (type) {
                // update UI ...
            }
      });

      new Cleave('#cc-exp-date', {
          date: true,
          datePattern: ['m', 'Y']
      });

      new StickySidebar('.sidebar-sticky', {topSpacing: 20});
    });

    this.get_direccion_principal();

    paypal.Buttons({
      style: {
          layout: 'horizontal'
      },
      createOrder: (data,actions)=>{
  
          return actions.order.create({
            purchase_units : [{
              description : 'Pago en Mi Tienda',
              amount : {
                currency_code : 'USD',
                value: this.subtotal
              },
            }]
          });
        
      },
      onApprove : async (data,actions)=>{
        const order = await actions.order.capture();
        console.log(order);
        
        this.venta.transaccion = order.purchase_units[0].payments.captures[0].id;

        this.venta.detalles = this.dventa;
        this._clienteService.registro_compra_cliente(this.venta,this.token).subscribe(
          response=>{

            this._clienteService.enviar_correo_compra_cliente(response.venta._id,this.token).subscribe(
              response=>{
                this._router.navigate(['/']);
              }
            );
          }
        );
        
      },
      onError : err =>{
       
      },
      onCancel: function (data, actions) {
        
      }
    }).render(this.paypalElement.nativeElement);
  }

  init_Data(){
    this._clienteService.obtener_carrito_cliente(this.idcliente,this.token).subscribe(
      response=>{
        this.carrito_arr = response.data;

        this.carrito_arr.forEach(element => {
            this.dventa.push({
              producto: element.producto._id,
              subtotal: element.producto.precio,
              variedad: element.variedad,
              cantidad: element.cantidad,
              cliente: localStorage.getItem('_id')
            });
        });
        this.carrito_load = false;

        this.calcular_carrito();
        this.cacular_total('Envio Gratis');
      }
    );
  }

  get_direccion_principal(){
    this._clienteService.obtener_direccion_principal_cliente(localStorage.getItem('_id'),this.token).subscribe(
      response=>{
        if(response.data == undefined){
          this.direccion_principal = undefined;
        }else{
          this.direccion_principal = response.data;
          this.venta.direccion = this.direccion_principal._id;
        }
        
        
      }
    );
  }

  calcular_carrito(){
    this.subtotal = 0;
    if(this.descuento_activo == undefined){
      this.carrito_arr.forEach(element => {
          this.subtotal = this.subtotal + parseInt(element.producto.precio);
      });
    }else if(this.descuento_activo != undefined){
      this.carrito_arr.forEach(element => {
        let new_precio = Math.round(parseInt(element.producto.precio) - (parseInt(element.producto.precio)*this.descuento_activo.descuento)/100);
        this.subtotal = this.subtotal + new_precio;
    });
    }
  }

  eliminar_item(id){
    this._clienteService.eliminar_carrito_cliente(id,this.token).subscribe(
      response=>{
        iziToast.show({
            title: 'SUCCESS',
            titleColor: '#1DC74C',
            color: '#FFF',
            class: 'text-success',
            position: 'topRight',
            message: 'Se eliminó el producto correctamente.'
        });
        this.socket.emit('delete-carrito',{data:response.data});
        this.init_Data();
        
      }
    );
  }

  cacular_total(envio_titulo){
    this.total_pagar = parseInt(this.subtotal.toString()) + parseInt(this.precio_envio);
    this.venta.subtotal = this.total_pagar;
    this.venta.envio_precio = parseInt(this.precio_envio);
    this.venta.envio_titulo = envio_titulo;

    console.log(this.venta);
    
  }

  get_token_culqi(){

    let month;
    let year;

    let exp_arr = this.card_data.exp.toString().split('/');

    let data = {
      "card_number": this.card_data.ncard.toString().replace(/ /g, ""),   
      "cvv": this.card_data.cvc,      
      "expiration_month": exp_arr[0],      
      "expiration_year":  exp_arr[1].toString().substr(0,4),      
      "email": this.user.email,         
    }
    this.btn_load = true;

    this._clienteService.get_token_culqi(data).subscribe(
      response=>{
       
        let charge = {
          "amount": this.subtotal+'00',
          "currency_code": "USD",
          "email": this.user.email,
          "source_id": response.id,
        }
        this._clienteService.get_charge_culqi(charge).subscribe(
          response=>{
            this.venta.transaccion = response.id;

            this.venta.detalles = this.dventa;
            this._clienteService.registro_compra_cliente(this.venta,this.token).subscribe(
              response=>{
                this.btn_load = false;
                this._clienteService.enviar_correo_compra_cliente(response.venta._id,this.token).subscribe(
                  response=>{
                    this._router.navigate(['/']);
                  }
                );

                
              }
            );
            
         
          }
        );
        
      }
    );
    
  }


  validar_cupon(){
    if(this.venta.cupon){
      if(this.venta.cupon.toString().length <= 25){
        
        this._clienteService.validar_cupon_admin(this.venta.cupon,this.token).subscribe(
          response=>{
            if(response.data != undefined){
              this.error_cupon = '';

              if(response.data.tipo == 'Valor fijo'){
                this.descuento = response.data.valor;
                this.total_pagar = this.total_pagar - this.descuento;
              }else if(response.data.tipo == 'Porcentaje'){
                this.descuento = (this.total_pagar * response.data.valor)/100;
                this.total_pagar = this.total_pagar - this.descuento;
              }


            }else{
              this.error_cupon = 'El cupon no se pudo canjear';
            }
  
          }
        );
      }else{
        //NO ES VALIDO
        this.error_cupon = 'El  cupon debe ser menos de 25 caracteres';
      }
    }else{
      this.error_cupon = 'El  cupon no es valido';
    }
  }
}

