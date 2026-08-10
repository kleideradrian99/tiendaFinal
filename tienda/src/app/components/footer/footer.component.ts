import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { io } from 'socket.io-client';
import { NgIf, NgFor, NgClass, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.css'],
    imports: [NgIf, NgFor, NgClass, FormsModule, RouterLink, DatePipe]
})
export class FooterComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  public token: string | null = null;
  public clienteId: string | null = null;
  public chat_open = false;
  public mensajes: Array<any> = [];
  public nuevo_mensaje = '';
  public unread_count = 0;
  
  public socket: any;

  private original_title = document.title;
  private title_interval: any = null;

  constructor(private _chatService: ChatService) {
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
    this.actualizar_sesion();

    this.socket.on('connect', () => {
      this.actualizar_sesion();
      if (this.clienteId) {
        this.socket.emit('join-chat', 'room_' + this.clienteId);
      }
    });

    if (this.token && this.clienteId) {
      // Cargar contador de mensajes no leídos iniciales
      this.cargar_mensajes(false);
    }

    // Restaurar título cuando el usuario regresa a la pestaña
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.detener_parpadeo_titulo();
      }
    });

    // Escuchar nuevos mensajes recibidos por Socket
    this.socket.on('new-message-chat', (data: any) => {
      this.actualizar_sesion();
      if (this.clienteId && data.cliente === this.clienteId) {
        this.mensajes.push(data);
        this.scrollToBottom();
        
        if (!this.chat_open) {
          this.unread_count++;
          this.reproducir_tono();
          this.iniciar_parpadeo_titulo();
        } else {
          // Si el chat está abierto, marcar lectura en la BD
          this._chatService.listar_mensajes_cliente(this.token!).subscribe();
          // Si el mensaje es del asesor, sonar de todas formas para alertar al cliente
          if (data.remitente === 'asesor') {
            this.reproducir_tono();
          }
        }
      }
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  reproducir_tono() {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = context.createOscillator();
      const gain = context.createGain();
      
      osc.connect(gain);
      gain.connect(context.destination);
      
      osc.type = 'sine';
      // Nota 1 (D5)
      osc.frequency.setValueAtTime(587.33, context.currentTime);
      gain.gain.setValueAtTime(0.08, context.currentTime);
      
      // Nota 2 (A5)
      osc.frequency.setValueAtTime(880, context.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.35);
      
      osc.start(context.currentTime);
      osc.stop(context.currentTime + 0.35);
    } catch (e) {
      console.warn('Web Audio API not allowed or supported yet:', e);
    }
  }

  iniciar_parpadeo_titulo() {
    if (document.hidden && !this.title_interval) {
      let toggle = false;
      this.title_interval = setInterval(() => {
        document.title = toggle ? '💬 Nuevo mensaje...' : this.original_title;
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

  actualizar_sesion() {
    this.token = localStorage.getItem('token');
    if (this.token === 'null' || this.token === 'undefined') {
      this.token = null;
    }
    this.clienteId = localStorage.getItem('_id');
    if (this.clienteId === 'null' || this.clienteId === 'undefined') {
      this.clienteId = null;
    }
  }

  toggle_chat() {
    this.actualizar_sesion();
    this.chat_open = !this.chat_open;
    
    if (this.chat_open) {
      this.unread_count = 0;
      if (this.token && this.clienteId) {
        this.socket.emit('join-chat', 'room_' + this.clienteId);
        this.cargar_mensajes(true);
      }
    }
  }

  cargar_mensajes(forceScroll: boolean) {
    if (this.token) {
      this._chatService.listar_mensajes_cliente(this.token).subscribe(
        response => {
          this.mensajes = response.data || [];
          if (forceScroll) {
            setTimeout(() => this.scrollToBottom(), 50);
          }
        },
        error => {
          console.error(error);
        }
      );
    }
  }

  enviar_mensaje() {
    if (this.nuevo_mensaje.trim() && this.token && this.clienteId) {
      const msgData = {
        mensaje: this.nuevo_mensaje.trim()
      };

      this._chatService.enviar_mensaje_cliente(msgData, this.token).subscribe(
        response => {
          const savedMsg = response.data;
          this.nuevo_mensaje = '';

          // Emitir a través del socket
          this.socket.emit('send-message-chat', {
            room: 'room_' + this.clienteId,
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

  private scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) { }
  }
}
