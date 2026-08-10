import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { ChatService } from 'src/app/services/chat.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { io } from 'socket.io-client';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    imports: [RouterLink, RouterLinkActive, NgIf]
})
export class SidebarComponent implements OnInit, OnDestroy {

  public menuOpen = false;
  public user: any = {};
  public total_unread = 0;
  public collapsed = false;
  
  public socket: any;
  public token: string | null = null;

  get homeRoute(): string {
    const role = this.user.role;
    if (['admin', 'direccion', 'finanzas'].includes(role)) {
      return '/inicio';
    } else if (role === 'asesora') {
      return '/panel/clientes';
    } else if (['compras', 'logistica'].includes(role)) {
      return '/panel/pedidos';
    } else if (role === 'soporte') {
      return '/panel/chat';
    }
    return '/panel/clientes';
  }

  constructor(
    private _router: Router,
    private _chatService: ChatService
  ) {
    this.token = localStorage.getItem('token');

    // Inicializar Socket.io
    let socketUrl = GLOBAL.url;
    if (socketUrl.endsWith('/api/')) {
      socketUrl = socketUrl.slice(0, -5);
    } else if (socketUrl.endsWith('/api')) {
      socketUrl = socketUrl.slice(0, -4);
    }

    this.socket = io(socketUrl);
  }

  ngOnInit(): void {
    this.collapsed = localStorage.getItem('sidebar_collapsed') === 'true';
    this.applySidebarState();
    this.solicitar_permisos_push();

    if (this.token) {
      const decoded = this.decodeToken(this.token);
      if (decoded) {
        this.user = {
          nombres: decoded.nombres,
          apellidos: decoded.apellidos,
          email: decoded.email,
          role: decoded.role || 'Administrador'
        };
      }

      this.cargar_no_leidos();

      // Escuchar nuevos mensajes para indicar sonido, push y cambiar pestaña
      this.socket.on('new-message-chat', (data: any) => {
        if (data.remitente === 'cliente') {
          this.reproducir_tono_sidebar();

          if (document.hidden) {
            this.iniciar_flasheo_pestana();
            this.mostrar_notificacion_push(data.mensaje);
          }

          if (!this._router.url.includes('/panel/chat')) {
            this.total_unread++;
          } else {
            setTimeout(() => this.cargar_no_leidos(), 500);
          }
        }
      });
    }

    // Limpiar flash al volver a enfocar la pestaña
    window.addEventListener('focus', () => {
      this.detener_flasheo_pestana();
    });
  }

  public interval_flash: any = null;

  solicitar_permisos_push() {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }

  mostrar_notificacion_push(mensaje: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Nuevo Mensaje de Asesoría', {
        body: mensaje,
        icon: 'assets/img/logo_prin.png'
      });
    }
  }

  iniciar_flasheo_pestana() {
    if (this.interval_flash) return;
    let toggle = false;
    this.interval_flash = setInterval(() => {
      document.title = toggle ? '🔔 (Nuevos Mensajes) - Mb Latina' : 'Mb Latina';
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

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  cargar_no_leidos() {
    if (this.token) {
      this._chatService.listar_conversaciones_asesor(this.token).subscribe(
        response => {
          const chats = response.data || [];
          this.total_unread = chats.reduce((sum: number, item: any) => sum + (item.unread || 0), 0);
        },
        error => {
          console.error(error);
        }
      );
    }
  }

  reproducir_tono_sidebar() {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = context.createOscillator();
      const gain = context.createGain();
      
      osc.connect(gain);
      gain.connect(context.destination);
      
      osc.type = 'sine';
      // Nota corta
      osc.frequency.setValueAtTime(659.25, context.currentTime);
      gain.gain.setValueAtTime(0.08, context.currentTime);
      
      osc.frequency.setValueAtTime(987.77, context.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.3);
      
      osc.start(context.currentTime);
      osc.stop(context.currentTime + 0.3);
    } catch (e) { }
  }

  decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(payload));
    } catch (e) {
      return null;
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    if (this.menuOpen) {
      document.body.classList.add('cs-offcanvas-open');
    } else {
      document.body.classList.remove('cs-offcanvas-open');
    }
  }

  closeMenu() {
    this.menuOpen = false;
    document.body.classList.remove('cs-offcanvas-open');
  }

  logout() {
    localStorage.clear();
    this.closeMenu();
    this._router.navigate(['/login']);
  }

  toggleCollapse() {
    this.collapsed = !this.collapsed;
    localStorage.setItem('sidebar_collapsed', String(this.collapsed));
    this.applySidebarState();
  }

  applySidebarState() {
    if (this.collapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
  }

}
