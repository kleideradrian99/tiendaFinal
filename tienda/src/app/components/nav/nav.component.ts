import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
declare var $;
import { io } from "socket.io-client";
import { GuestService } from 'src/app/services/guest.service';
import { NgIf, NgFor } from '@angular/common';
import { DescuentoPipe } from '../../pipes/descuento.pipe';
declare var iziToast;

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.css'],
    imports: [NgIf, RouterLink, RouterLinkActive, NgFor, DescuentoPipe]
})
export class NavComponent implements OnInit {

  public token;
  public id;
  public user: any = undefined;
  public user_lc: any = undefined;
  public config_global: any = {};
  public op_cart = false;

  public carrito_arr: Array<any> = [];
  public url;
  public subtotal = 0;
  public socket = io(GLOBAL.url.replace('/api/', ''));
  public descuento_activo: any = undefined;

  constructor(
    private _clienteService: ClienteService,
    private _router: Router,
    private _guestService: GuestService
  ) {
    this.token = localStorage.getItem('token');
    if (this.token === 'null' || this.token === 'undefined') {
      this.token = null;
    }
    this.id = localStorage.getItem('_id');
    if (this.id === 'null' || this.id === 'undefined') {
      this.id = null;
    }
    this.url = GLOBAL.url;

    this._clienteService.obtener_config_publico().subscribe(
      response => {
        this.config_global = response.data;
      }
    )

    if (this.token && this.id) {
      this._clienteService.obtener_cliente_guest(this.id, this.token).subscribe(
        res => {
          this.user = res.data;
          localStorage.setItem('user_data', JSON.stringify(this.user));

          if (localStorage.getItem('user_data')) {
            this.user_lc = JSON.parse(localStorage.getItem('user_data') || '{}');
            this.obtener_carrito();
          } else {
            this.user_lc = undefined;
          }
        }, error => {
          console.error(error);
          this.user = undefined;
          this.user_lc = undefined;
          // Limpiar datos de sesión corruptos/expirados para salir del bucle
          localStorage.removeItem('token');
          localStorage.removeItem('_id');
          localStorage.removeItem('user_data');
        });
    } else {
      // Limpiar en caso de inconsistencia
      this.token = null;
      this.id = null;
      this.user = undefined;
      this.user_lc = undefined;
    }




  }

  obtener_carrito() {
    this._clienteService.obtener_carrito_cliente(this.user_lc._id, this.token).subscribe(
      response => {
        this.carrito_arr = response.data;
        this.calcular_carrito();
      }
    );
  }

  ngOnInit(): void {
    this.solicitar_permisos_push();

    this.socket.on('new-carrito', function (data) {
      console.log(data);
      this.obtener_carrito();
    }.bind(this));

    this.socket.on('new-carrito-add', function (data) {
      console.log(data);
      this.obtener_carrito();
    }.bind(this));

    // Escuchar mensajes del asesor en tiempo real
    this.socket.on('new-message-chat', (data: any) => {
      if (data.remitente === 'asesor' && data.cliente === this.id) {
        this.reproducir_tono_nav();

        if (document.hidden) {
          this.iniciar_flasheo_pestana();
          this.mostrar_notificacion_push(data.mensaje);
        }
      }
    });

    // Limpiar flash al volver a enfocar la pestaña
    window.addEventListener('focus', () => {
      this.detener_flasheo_pestana();
    });

    this._guestService.obtener_descuento_activo().subscribe(
      response => {
        if (response.data != undefined) {
          this.descuento_activo = response.data[0];
        } else {
          this.descuento_activo = undefined;
        }
      }
    );
  }

  public interval_flash: any = null;

  solicitar_permisos_push() {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }

  mostrar_notificacion_push(mensaje: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Tu Asesor de Ventas', {
        body: mensaje,
        icon: 'assets/img/logo_prin.png'
      });
    }
  }

  iniciar_flasheo_pestana() {
    if (this.interval_flash) return;
    let toggle = false;
    this.interval_flash = setInterval(() => {
      document.title = toggle ? '💬 (Tu Asesor te escribió) - Mb Latina' : 'Mb Latina';
      toggle = !toggle;
    }, 1000);
  }

  detener_flasheo_pestana() {
    if (this.interval_flash) {
      clearInterval(this.interval_flash);
      this.interval_flash = null;
      document.title = 'Mb Latina';
    }
  }

  reproducir_tono_nav() {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = context.createOscillator();
      const gain = context.createGain();
      
      osc.connect(gain);
      gain.connect(context.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, context.currentTime); // C5
      gain.gain.setValueAtTime(0.08, context.currentTime);
      
      osc.frequency.setValueAtTime(783.99, context.currentTime + 0.08); // G5
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.3);
      
      osc.start(context.currentTime);
      osc.stop(context.currentTime + 0.3);
    } catch (e) { }
  }


  logout() {
    window.location.reload();
    localStorage.clear();
    this._router.navigate(['/']);
  }

  op_modalcart() {
    if (!this.op_cart) {
      this.op_cart = true;
      $('#cart').addClass('show');
    } else {
      this.op_cart = false;
      $('#cart').removeClass('show');
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
      }
    );
  }
}
