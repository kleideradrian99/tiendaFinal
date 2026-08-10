import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NgFor, NgIf, NgClass, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from 'src/app/services/chat.service';
import { AdminService } from 'src/app/services/admin.service';
import { ClienteService } from 'src/app/services/cliente.service';
import { ProformaService } from 'src/app/services/proforma.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { io } from 'socket.io-client';

declare var iziToast: any;

@Component({
  selector: 'app-index-chat',
  templateUrl: './index-chat.html',
  styleUrls: ['./index-chat.css'],
  imports: [SidebarComponent, NgFor, NgIf, NgClass, DatePipe, CurrencyPipe, FormsModule]
})
export class IndexChat implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  public token: string | null = null;
  public adminId: string | null = null;
  public conversaciones: Array<any> = [];
  public mensajes: Array<any> = [];
  
  public cliente_seleccionado: any = null;
  public nuevo_mensaje = '';
  public load_conversaciones = true;
  public load_mensajes = false;

  public asesores: Array<any> = [];
  public current_user_role: string | null = '';
  
  // Resumen del cliente
  public carrito_cliente: Array<any> = [];
  public proformas_cliente: Array<any> = [];
  
  public socket: any;

  private original_title = document.title;
  private title_interval: any = null;

  constructor(
    private _chatService: ChatService,
    private _adminService: AdminService,
    private _clienteService: ClienteService,
    private _proformaService: ProformaService
  ) {
    this.token = this._adminService.getToken();
    this.adminId = localStorage.getItem('_id');

    // Inicializar Socket.io dinámicamente según la URL global
    let socketUrl = GLOBAL.url;
    if (socketUrl.endsWith('/api/')) {
      socketUrl = socketUrl.slice(0, -5);
    } else if (socketUrl.endsWith('/api')) {
      socketUrl = socketUrl.slice(0, -4);
    }

    this.socket = io(socketUrl);
  }

  ngOnInit(): void {
    if (this.token) {
      this.current_user_role = this._adminService.getRole();
      if (['admin', 'direccion'].includes(this.current_user_role)) {
        this._adminService.listar_usuarios_internos('null', this.token).subscribe(
          response => {
            this.asesores = response.data.filter((u: any) => ['asesora', 'soporte'].includes(u.rol));
          }
        );
      }

      this.init_conversaciones();

      this.socket.on('connect', () => {
        if (this.cliente_seleccionado) {
          this.socket.emit('join-chat', 'room_' + this.cliente_seleccionado._id);
        }
      });

      // Escuchar nuevos mensajes
      this.socket.on('new-message-chat', (data: any) => {
        // Sonar y parpadear pestaña si el remitente es el cliente
        if (data.remitente === 'cliente') {
          this.reproducir_tono();
          this.iniciar_parpadeo_titulo();
        }

        // Si el mensaje recibido pertenece al chat activo
        if (this.cliente_seleccionado && data.cliente === this.cliente_seleccionado._id) {
          this.mensajes.push(data);
          this.scrollToBottom();

          // Recalcular carrito y proformas si el mensaje indica algún cambio
          this.cargar_resumen_cliente(this.cliente_seleccionado._id);
        }

        // Actualizar la lista lateral de conversaciones
        this.actualizar_conversacion_lateral(data);
      });

      // Detener parpadeo cuando la asesora regrese a la pestaña
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          this.detener_parpadeo_titulo();
        }
      });
    }
  }

  reproducir_tono() {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = context.createOscillator();
      const gain = context.createGain();
      
      osc.connect(gain);
      gain.connect(context.destination);
      
      osc.type = 'sine';
      // Nota 1 (E5)
      osc.frequency.setValueAtTime(659.25, context.currentTime);
      gain.gain.setValueAtTime(0.08, context.currentTime);
      
      // Nota 2 (B5)
      osc.frequency.setValueAtTime(987.77, context.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.35);
      
      osc.start(context.currentTime);
      osc.stop(context.currentTime + 0.35);
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  iniciar_parpadeo_titulo() {
    if (document.hidden && !this.title_interval) {
      let toggle = false;
      this.title_interval = setInterval(() => {
        document.title = toggle ? '💬 ¡Mensaje Nuevo!' : this.original_title;
        toggle = !toggle;
      }, 1000);
    }
  }

  detener_parpadeo_titulo() {
    if (this.title_interval) {
      clearInterval(this.title_interval);
      this.title_interval = null;
    }
    document.title = this.original_title;
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  init_conversaciones() {
    this.load_conversaciones = true;
    this._chatService.listar_conversaciones_asesor(this.token!).subscribe(
      response => {
        this.conversaciones = response.data || [];
        this.load_conversaciones = false;
      },
      error => {
        console.error(error);
        this.load_conversaciones = false;
      }
    );
  }

  seleccionar_chat(chat: any) {
    this.load_mensajes = true;
    this.mensajes = [];

    // Load full client details to get the assigned advisor
    this._clienteService.obtener_cliente_admin(chat.cliente._id, this.token!).subscribe(
      response => {
        this.cliente_seleccionado = response.data;
        if (this.cliente_seleccionado) {
          const a = this.cliente_seleccionado.asesor;
          this.cliente_seleccionado.asesorId = (a && typeof a === 'object') ? (a._id || '') : (a || '');
        }
        // Unirse a la sala de Socket
        this.socket.emit('join-chat', 'room_' + this.cliente_seleccionado._id);

        // Cargar mensajes
        this._chatService.listar_mensajes_asesor(this.cliente_seleccionado._id, this.token!).subscribe(
          res => {
            this.mensajes = res.data || [];
            this.load_mensajes = false;
            
            // Quitar indicador visual de no leídos localmente
            chat.unread = 0;
            
            setTimeout(() => this.scrollToBottom(), 50);
          },
          err => {
            console.error(err);
            this.load_mensajes = false;
          }
        );

        // Cargar resumen del carrito y proformas
        this.cargar_resumen_cliente(this.cliente_seleccionado._id);
      },
      error => {
        console.error(error);
        // Fallback to chat client if call fails
        this.cliente_seleccionado = chat.cliente;
        this.load_mensajes = false;
      }
    );
  }

  cargar_resumen_cliente(clienteId: string) {
    // 1. Obtener carrito actual del e-commerce (Avión de Compras del cliente)
    this._clienteService.obtener_carrito_cliente(clienteId, this.token!).subscribe(
      response => {
        this.carrito_cliente = response.data || [];
      }
    );

    // 2. Obtener proformas (y filtrarlas por este cliente)
    this._proformaService.listar_proformas_admin(this.token!).subscribe(
      response => {
        const allProformas = response.data || [];
        this.proformas_cliente = allProformas.filter((p: any) => p.cliente?._id === clienteId);
      }
    );
  }

  enviar_mensaje() {
    if (this.nuevo_mensaje.trim() && this.cliente_seleccionado && this.token) {
      const msgData = {
        cliente: this.cliente_seleccionado._id,
        mensaje: this.nuevo_mensaje.trim()
      };

      this._chatService.enviar_mensaje_asesor(msgData, this.token!).subscribe(
        response => {
          const savedMsg = response.data;
          this.nuevo_mensaje = '';

          // Emitir por Socket
          this.socket.emit('send-message-chat', {
            room: 'room_' + this.cliente_seleccionado._id,
            ...savedMsg
          });

          this.scrollToBottom();
        },
        error => {
          console.error(error);
        }
      );
    }
  }

  actualizar_conversacion_lateral(msg: any) {
    const chatIndex = this.conversaciones.findIndex(c => c.cliente._id === msg.cliente);
    if (chatIndex !== -1) {
      const chat = this.conversaciones[chatIndex];
      chat.ultimo_mensaje = msg.mensaje;
      chat.ultimo_remitente = msg.remitente;
      chat.fecha = msg.createdAt;
      
      // Incrementar unread si no es el chat seleccionado y el remitente es el cliente
      if ((!this.cliente_seleccionado || this.cliente_seleccionado._id !== msg.cliente) && msg.remitente === 'cliente') {
        chat.unread++;
      }

      // Mover al principio de la lista
      this.conversaciones.splice(chatIndex, 1);
      this.conversaciones.unshift(chat);
    } else {
      // Si es un chat nuevo que no estaba en la lista lateral
      this.init_conversaciones();
    }
  }

  reasignar_asesor(event: any) {
    const newAsesorId = event.target.value;
    if (this.cliente_seleccionado && this.token) {
      const updateData = { ...this.cliente_seleccionado, asesor: newAsesorId || null };
      
      this._clienteService.actulizar_cliente_admin(this.cliente_seleccionado._id, updateData, this.token).subscribe(
        response => {
          iziToast.show({
            title: 'SUCCESS',
            titleColor: '#1DC74C',
            color: '#FFF',
            class: 'text-success',
            position: 'topRight',
            message: 'Asesor reasignado correctamente.'
          });
          // Refresh local asesor details
          this.cliente_seleccionado.asesor = newAsesorId ? this.asesores.find(a => a._id === newAsesorId) : null;
          this.cliente_seleccionado.asesorId = newAsesorId;
          this.init_conversaciones();
        },
        error => {
          console.error(error);
          iziToast.show({
            title: 'ERROR',
            titleColor: '#FF0000',
            color: '#FFF',
            class: 'text-danger',
            position: 'topRight',
            message: 'Error al reasignar el asesor.'
          });
        }
      );
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) { }
  }
}
