import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ClienteService } from 'src/app/services/cliente.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { io } from "socket.io-client";
import { GuestService } from 'src/app/services/guest.service';
import { Router, RouterLinkActive, RouterLink } from '@angular/router';
import { NavComponent } from '../nav/nav.component';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';
import { DescuentoPipe } from '../../pipes/descuento.pipe';
declare var iziToast;
declare var Cleave;
declare var StickySidebar;
declare var paypal;

interface HtmlInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

@Component({
    selector: 'app-carrito',
    templateUrl: './carrito.component.html',
    styleUrls: ['./carrito.component.css'],
    imports: [NavComponent, RouterLinkActive, RouterLink, NgIf, NgFor, FormsModule, FooterComponent, DescuentoPipe]
})
export class CarritoComponent implements OnInit {
  @ViewChild('paypalButton', { static: true }) paypalElement: ElementRef;
  public idcliente;
  public token;

  public carrito_arr: Array<any> = [];
  public url;
  public subtotal = 0;
  public total_pagar: any = 0;
  public socket = io('http://localhost:4201');

  public direccion_principal: any = {};
  public envios: Array<any> = [];

  public precio_envio = "0";

  public venta: any = {};
  public dventa: Array<any> = [];
  public card_data: any = {};
  public btn_load = false;
  public carrito_load = true;

  public user: any = {};
  public descuento = 0;
  public error_cupon = '';

  public descuento_activo: any = undefined;

  // Nuevas propiedades para direcciones y autocompletado por Geolocalización
  public direcciones: Array<any> = [];
  public direccion_nuevo: any = {
    pais: '',
    region: '', // Rellena el Estado
    provincia: '', // Rellena la Ciudad
    principal: true
  };

  public op_nueva_direccion = false;
  public culqi_public_key = '';
  public metodo_pago = 'Tarjeta';

  constructor(
    private _clienteService: ClienteService,
    private _guestService: GuestService,
    private _router: Router
  ) {

    this.idcliente = localStorage.getItem('_id');
    this.venta.cliente = this.idcliente;
    this.token = localStorage.getItem('token');
    this.url = GLOBAL.url;


    this._guestService.get_Envios().subscribe(
      response => {
        this.envios = response;

      }
    );

    this.user = JSON.parse(localStorage.getItem('user_data'));
  }

  ngOnInit(): void {

    this._guestService.obtener_descuento_activo().subscribe(
      response => {
        if (response.data != undefined) {
          this.descuento_activo = response.data[0];
        } else {
          this.descuento_activo = undefined;
        }

      }
    );


    this.init_Data();
    setTimeout(() => {
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

      new StickySidebar('.sidebar-sticky', { topSpacing: 20 });
    });

    this.obtener_direcciones();

    // Geolocalización del usuario por IP para precargar país, código postal, estado y ciudad
    this._guestService.obtener_geolocalizacion().subscribe(
      res => {
        console.log("Geolocalización por IP:", res);
        if (res) {
          if (res.country_name) {
            let detectedCountry = res.country_name;
            if (detectedCountry === 'Peru') {
              detectedCountry = 'Perú';
            }
            this.direccion_nuevo.pais = detectedCountry;
          }
          if (res.region) {
            this.direccion_nuevo.region = res.region; // Estado
          }
          if (res.city) {
            this.direccion_nuevo.provincia = res.city; // Ciudad
          }
          if (res.postal) {
            this.direccion_nuevo.zip = res.postal;
          }
        }
      },
      err => {
        console.error("Error al obtener la geolocalización por IP:", err);
      }
    );

    this._clienteService.obtener_culqi_public_key().subscribe(
      response => {
        this.culqi_public_key = response.publicKey;
      },
      err => {
        console.error("Error al obtener la clave pública de Culqi:", err);
      }
    );

    this._clienteService.obtener_paypal_client_id().subscribe(
      response => {
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${response.clientId}&currency=USD`;
        script.onload = () => {
          this.init_Paypal_Buttons();
        };
        document.body.appendChild(script);
      }
    );
  }

  init_Paypal_Buttons() {
    paypal.Buttons({
      style: {
        layout: 'horizontal'
      },
      createOrder: (data: any, actions: any) => {
        this.btn_load = true;
        return new Promise((resolve, reject) => {
          const orderPayload = {
            cupon: this.venta.cupon,
            envio_precio: this.precio_envio
          };
          this._clienteService.crear_orden_paypal(orderPayload, this.token).subscribe(
            res => {
              resolve(res.orderID);
            },
            err => {
              console.error(err);
              this.btn_load = false;
              iziToast.show({
                title: 'ERROR',
                titleColor: '#FF0000',
                color: '#FFF',
                class: 'text-danger',
                position: 'topRight',
                message: 'No se pudo iniciar el pago con PayPal.'
              });
              reject(err);
            }
          );
        });
      },
      onApprove: async (data: any, actions: any) => {
        this.btn_load = true;
        this._clienteService.capturar_orden_paypal(data.orderID, this.token).subscribe(
          res => {
            const capture = res.captureData.purchase_units[0].payments.captures[0];
            if (capture.status === 'COMPLETED') {
              this.venta.transaccion = capture.id;
              this.venta.detalles = this.dventa;
              this._clienteService.registro_compra_cliente(this.venta, this.token).subscribe(
                response => {
                  this.btn_load = false;
                  this._clienteService.enviar_correo_compra_cliente(response.venta._id, this.token).subscribe(
                    response => {
                      this._router.navigate(['/']);
                    },
                    err => {
                      console.error("Error al enviar el correo:", err);
                      this._router.navigate(['/']);
                    }
                  );
                },
                err => {
                  console.error(err);
                  this.btn_load = false;
                  iziToast.show({
                    title: 'ERROR',
                    titleColor: '#FF0000',
                    color: '#FFF',
                    class: 'text-danger',
                    position: 'topRight',
                    message: 'Error al registrar la compra en el sistema.'
                  });
                }
              );
            } else {
              this.btn_load = false;
              iziToast.show({
                title: 'ERROR',
                titleColor: '#FF0000',
                color: '#FFF',
                class: 'text-danger',
                position: 'topRight',
                message: 'El pago no pudo ser capturado correctamente.'
              });
            }
          },
          err => {
            console.error(err);
            this.btn_load = false;
            iziToast.show({
              title: 'ERROR',
              titleColor: '#FF0000',
              color: '#FFF',
              class: 'text-danger',
              position: 'topRight',
              message: 'Error al capturar el pago.'
            });
          }
        );
      },
      onError: (err: any) => {
        console.error(err);
        this.btn_load = false;
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: 'Ocurrió un error con el procesador de pagos de PayPal.'
        });
      },
      onCancel: (data: any, actions: any) => {
        this.btn_load = false;
        iziToast.show({
          title: 'CANCELADO',
          titleColor: '#FFC107',
          color: '#FFF',
          class: 'text-warning',
          position: 'topRight',
          message: 'El pago con PayPal fue cancelado.'
        });
      }
    }).render(this.paypalElement.nativeElement);
  }

  init_Data() {
    this._clienteService.obtener_carrito_cliente(this.idcliente, this.token).subscribe(
      response => {
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

  obtener_direcciones() {
    this._clienteService.obtener_direccion_todos_cliente(this.idcliente, this.token).subscribe(
      response => {
        this.direcciones = response.data || [];
        if (this.direcciones.length == 0) {
          this.op_nueva_direccion = true;
          this.direccion_principal = undefined;
        } else {
          const principal = this.direcciones.find(item => item.principal);
          if (principal) {
            this.direccion_principal = principal;
          } else {
            this.direccion_principal = this.direcciones[0];
          }
          this.venta.direccion = this.direccion_principal._id;
        }
      }
    );
  }

  seleccionar_direccion(id) {
    const matched = this.direcciones.find(item => item._id == id);
    if (matched) {
      this.direccion_principal = matched;
      this.venta.direccion = matched._id;
    }
  }

  registrar_direccion(registroForm) {
    if (registroForm.valid) {
      let data = {
        destinatario: this.direccion_nuevo.destinatario,
        dni: '', // Omitido por solicitud del usuario
        zip: this.direccion_nuevo.zip,
        direccion: this.direccion_nuevo.direccion,
        telefono: this.direccion_nuevo.telefono,
        pais: this.direccion_nuevo.pais,
        region: this.direccion_nuevo.region, // Estado
        provincia: this.direccion_nuevo.provincia, // Ciudad
        distrito: '', // Omitido
        principal: this.direccion_nuevo.principal,
        cliente: this.idcliente
      }

      this._clienteService.registro_direccion_cliente(data, this.token).subscribe(
        response => {
          this.direccion_nuevo = {
            pais: '',
            region: '',
            provincia: '',
            principal: true
          };
          this.op_nueva_direccion = false;
          this.obtener_direcciones();

          iziToast.show({
            title: 'SUCCESS',
            titleColor: '#1DC74C',
            color: '#FFF',
            class: 'text-success',
            position: 'topRight',
            message: 'Se agregó la nueva dirección correctamente.'
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
        message: 'Los datos del formulario de dirección no son válidos.'
      });
    }
  }

  calcular_carrito() {
    this.subtotal = 0;
    if (this.descuento_activo == undefined) {
      this.carrito_arr.forEach(element => {
        this.subtotal = this.subtotal + parseInt(element.producto.precio);
      });
    } else if (this.descuento_activo != undefined) {
      this.carrito_arr.forEach(element => {
        let new_precio = Math.round(parseInt(element.producto.precio) - (parseInt(element.producto.precio) * this.descuento_activo.descuento) / 100);
        this.subtotal = this.subtotal + new_precio;
      });
    }
  }

  eliminar_item(id) {
    this._clienteService.eliminar_carrito_cliente(id, this.token).subscribe(
      response => {
        iziToast.show({
          title: 'SUCCESS',
          titleColor: '#1DC74C',
          color: '#FFF',
          class: 'text-success',
          position: 'topRight',
          message: 'Se eliminó el producto correctamente.'
        });
        this.socket.emit('delete-carrito', { data: response.data });
        this.init_Data();

      }
    );
  }

  cacular_total(envio_titulo) {
    this.total_pagar = parseInt(this.subtotal.toString()) + parseInt(this.precio_envio);
    this.venta.subtotal = this.total_pagar;
    this.venta.envio_precio = parseInt(this.precio_envio);
    this.venta.envio_titulo = envio_titulo;

    console.log(this.venta);

  }

  get_token_culqi() {
    if (!this.card_data.ncard || !this.card_data.exp || !this.card_data.cvc) {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Por favor complete todos los datos de la tarjeta.'
      });
      return;
    }

    let exp_arr = [];
    try {
      exp_arr = this.card_data.exp.toString().split('/');
      if (exp_arr.length !== 2) throw new Error("Fecha de expiración inválida");
    } catch (e) {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Formato de expiración incorrecto (use MM/AAAA o MM/AA).'
      });
      return;
    }

    let data = {
      "card_number": this.card_data.ncard.toString().replace(/ /g, ""),
      "cvv": this.card_data.cvc,
      "expiration_month": exp_arr[0].trim(),
      "expiration_year": exp_arr[1].trim().substr(0, 4),
      "email": this.user.email,
    };
    
    this.btn_load = true;

    this._clienteService.get_token_culqi(data, this.culqi_public_key).subscribe(
      response => {
        if (response && response.id) {
          let charge = {
            "amount": this.subtotal + '00',
            "currency_code": "USD",
            "email": this.user.email,
            "source_id": response.id,
          };
          this._clienteService.get_charge_culqi(charge, this.token).subscribe(
            resCharge => {
              if (resCharge && resCharge.id) {
                this.venta.transaccion = resCharge.id;
                this.venta.detalles = this.dventa;
                
                this._clienteService.registro_compra_cliente(this.venta, this.token).subscribe(
                  resVenta => {
                    this.btn_load = false;
                    this._clienteService.enviar_correo_compra_cliente(resVenta.venta._id, this.token).subscribe(
                      resCorreo => {
                        this._router.navigate(['/']);
                      },
                      errCorreo => {
                        console.error("Error al enviar correo:", errCorreo);
                        this._router.navigate(['/']);
                      }
                    );
                  },
                  errVenta => {
                    console.error("Error al registrar compra:", errVenta);
                    this.btn_load = false;
                    iziToast.show({
                      title: 'ERROR',
                      titleColor: '#FF0000',
                      color: '#FFF',
                      class: 'text-danger',
                      position: 'topRight',
                      message: 'Error al registrar la compra en el sistema.'
                    });
                  }
                );
              } else {
                this.btn_load = false;
                iziToast.show({
                  title: 'ERROR',
                  titleColor: '#FF0000',
                  color: '#FFF',
                  class: 'text-danger',
                  position: 'topRight',
                  message: 'No se pudo procesar el cargo de la tarjeta.'
                });
              }
            },
            errCharge => {
              console.error("Error al cobrar:", errCharge);
              this.btn_load = false;
              iziToast.show({
                title: 'ERROR',
                titleColor: '#FF0000',
                color: '#FFF',
                class: 'text-danger',
                position: 'topRight',
                message: 'Tarjeta rechazada o fondos insuficientes.'
              });
            }
          );
        } else {
          this.btn_load = false;
          iziToast.show({
            title: 'ERROR',
            titleColor: '#FF0000',
            color: '#FFF',
            class: 'text-danger',
            position: 'topRight',
            message: 'No se pudo verificar la tarjeta.'
          });
        }
      },
      errToken => {
        console.error("Error token culqi:", errToken);
        this.btn_load = false;
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: 'Error de comunicación con el pasador de pagos.'
        });
      }
    );
  }


  validar_cupon() {
    if (this.venta.cupon) {
      if (this.venta.cupon.toString().length <= 25) {

        this._clienteService.validar_cupon_admin(this.venta.cupon, this.token).subscribe(
          response => {
            if (response.data != undefined) {
              this.error_cupon = '';

              if (response.data.tipo == 'Valor fijo') {
                this.descuento = response.data.valor;
                this.total_pagar = this.total_pagar - this.descuento;
              } else if (response.data.tipo == 'Porcentaje') {
                this.descuento = (this.total_pagar * response.data.valor) / 100;
                this.total_pagar = this.total_pagar - this.descuento;
              }


            } else {
              this.error_cupon = 'El cupon no se pudo canjear';
            }

          }
        );
      } else {
        //NO ES VALIDO
        this.error_cupon = 'El  cupon debe ser menos de 25 caracteres';
      }
    } else {
      this.error_cupon = 'El  cupon no es valido';
    }
  }

  completar_orden() {
    if (this.metodo_pago === 'Tarjeta') {
      this.get_token_culqi();
    } else if (this.metodo_pago === 'Efectivo') {
      this.get_pago_contraentrega();
    }
  }

  get_pago_contraentrega() {
    if (!this.venta.direccion) {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Por favor seleccione o registre una dirección de envío.'
      });
      return;
    }

    this.btn_load = true;
    this.venta.transaccion = 'PAGO CONTRAENTREGA';
    this.venta.detalles = this.dventa;

    this._clienteService.registro_compra_cliente(this.venta, this.token).subscribe(
      response => {
        this.btn_load = false;
        iziToast.show({
          title: 'ÉXITO',
          titleColor: '#1DC74C',
          color: '#FFF',
          class: 'text-success',
          position: 'topRight',
          message: 'Tu pedido ha sido registrado con éxito.'
        });
        this._clienteService.enviar_correo_compra_cliente(response.venta._id, this.token).subscribe(
          resCorreo => {
            this._router.navigate(['/']);
          },
          errCorreo => {
            console.error("Error al enviar correo:", errCorreo);
            this._router.navigate(['/']);
          }
        );
      },
      err => {
        console.error("Error al registrar compra contraentrega:", err);
        this.btn_load = false;
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: 'Ocurrió un error al registrar el pedido.'
        });
      }
    );
  }
}

