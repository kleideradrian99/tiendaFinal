import { Component, OnInit } from '@angular/core';
import { ClienteService } from 'src/app/services/cliente.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { io } from "socket.io-client";
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, NgClass, DecimalPipe } from '@angular/common';
import { NavComponent } from '../nav/nav.component';
import { FooterComponent } from '../footer/footer.component';

declare var iziToast: any;
declare var lightGallery: any;

@Component({
  selector: 'app-muro',
  templateUrl: './muro.html',
  styleUrls: ['./muro.css'],
  imports: [NavComponent, FooterComponent, FormsModule, NgIf, NgFor, DecimalPipe, NgClass, RouterLink]
})
export class Muro implements OnInit {

  public productos: Array<any> = [];
  public productos_orig: Array<any> = [];
  public load_data = true;
  public url;
  public token;
  public socket = io('http://localhost:4201');

  // Filtros y ordenamiento
  public soloTendencia = false;
  public orden = 'reciente';

  // Guardar selección de talla, cantidad, imagen activa y estado de carga por ID de producto
  public selecciones: { [key: string]: any } = {};

  // Control de gestos táctiles para deslizar imágenes
  private touchStartX = 0;
  private touchEndX = 0;

  constructor(
    private _clienteService: ClienteService,
    private _router: Router
  ) {
    this.url = GLOBAL.url;
    this.token = localStorage.getItem('token');
  }

  ngOnInit(): void {
    this.obtener_productos();
  }

  obtener_productos() {
    this.load_data = true;
    this._clienteService.listar_productos_publico('').subscribe(
      response => {
        if (response.data) {
          // Filtrar solo productos en estado Publicado y guardarlo en el origen constante
          this.productos_orig = response.data.filter((item: any) => item.estado === 'Publicado');
          
          // Inicializar variables de selección para cada producto
          this.productos_orig.forEach((item: any) => {
            this.selecciones[item._id] = {
              variedad: '',
              cantidad: 1,
              imagen_activa: 0,
              btn_loading: false
            };
          });

          // Aplicar filtros e inicializar lista a mostrar
          this.filtrarYOrdenar();
        }
        this.load_data = false;
      },
      error => {
        console.log(error);
        this.load_data = false;
      }
    );
  }

  filtrarYOrdenar() {
    let temp = [...this.productos_orig];

    // 1. Filtrar por tendencias si está activo
    if (this.soloTendencia) {
      temp = temp.filter(item => item.en_tendencia);
    }

    // 2. Ordenamiento de productos
    if (this.orden === 'reciente') {
      temp.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (this.orden === 'economico') {
      temp.sort((a, b) => a.precio - b.precio);
    } else if (this.orden === 'costoso') {
      temp.sort((a, b) => b.precio - a.precio);
    }

    this.productos = temp;

    // Inicializar o refrescar lightGallery en las tarjetas mostradas
    setTimeout(() => {
      const e = document.querySelectorAll(".cs-gallery");
      if (e.length) {
        for (let t = 0; t < e.length; t++) {
          lightGallery(e[t], { 
            selector: ".cs-gallery-item", 
            download: false, 
            videojs: true, 
            youtubePlayerParams: { modestbranding: 1, showinfo: 0, rel: 0 }, 
            vimeoPlayerParams: { byline: 0, portrait: 0 } 
          });
        }
      }
    }, 200);
  }

  seleccionarVariedad(productoId: string, valor: string) {
    this.selecciones[productoId].variedad = valor;
  }

  cambiarImagen(productoId: string, index: number) {
    this.selecciones[productoId].imagen_activa = index;
  }

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent, producto: any) {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe(producto);
  }

  handleSwipe(producto: any) {
    const swipeThreshold = 50; // Umbral de píxeles para reconocer el deslizamiento
    const sel = this.selecciones[producto._id];
    if (!sel) return;

    const totalImages = 1 + (producto.galeria ? producto.galeria.length : 0);

    if (this.touchStartX - this.touchEndX > swipeThreshold) {
      // Deslizar izquierda -> Siguiente imagen
      if (sel.imagen_activa < totalImages - 1) {
        sel.imagen_activa++;
      } else {
        sel.imagen_activa = 0; // Volver al inicio
      }
    } else if (this.touchEndX - this.touchStartX > swipeThreshold) {
      // Deslizar derecha -> Imagen anterior
      if (sel.imagen_activa > 0) {
        sel.imagen_activa--;
      } else {
        sel.imagen_activa = totalImages - 1; // Ir al final
      }
    }
  }

  agregarAlCarrito(producto: any) {
    // Validar sesión activa usando el servicio
    if (!this._clienteService.isAuthenticated()) {
      iziToast.show({
        title: 'ATENCIÓN',
        titleColor: '#FFC107',
        color: '#FFF',
        class: 'text-warning',
        position: 'topRight',
        message: 'Inicie sesión para agregar productos al carrito.'
      });
      // Limpiar token expirado y redirigir
      localStorage.clear();
      this._router.navigate(['/login'], { queryParams: { returnUrl: this._router.url } });
      return;
    }

    // Refrescar el token local en caso de que haya cambiado
    this.token = localStorage.getItem('token');
    const sel = this.selecciones[producto._id];

    if (!sel.variedad) {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Seleccione una talla o variedad antes de agregar.'
      });
      return;
    }

    if (sel.cantidad > producto.stock) {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'La cantidad seleccionada supera el stock disponible.'
      });
      return;
    }

    let data = {
      producto: producto._id,
      cliente: localStorage.getItem('_id'),
      cantidad: sel.cantidad,
      variedad: sel.variedad
    };

    sel.btn_loading = true;
    this._clienteService.agregar_carrito_cliente(data, this.token).subscribe(
      response => {
        if (response.data == undefined) {
          iziToast.show({
            title: 'ERROR',
            titleColor: '#FF0000',
            color: '#FFF',
            class: 'text-danger',
            position: 'topRight',
            message: 'El producto ya existe en el carrito.'
          });
        } else {
          iziToast.show({
            title: 'ÉXITO',
            titleColor: '#1DC74C',
            color: '#FFF',
            class: 'text-success',
            position: 'topRight',
            message: 'Se agregó el producto al Avión de Compras.'
          });
          this.socket.emit('add-carrito-add', { data: true });
        }
        sel.btn_loading = false;
      },
      error => {
        console.log(error);
        sel.btn_loading = false;
      }
    );
  }

  generarLinkWhatsapp(producto: any): string {
    const sel = this.selecciones[producto._id];
    let mensaje = `Hola! Estoy interesado en el producto "${producto.titulo}"`;
    if (sel && sel.variedad) {
      mensaje += ` en la variedad/talla "${sel.variedad}"`;
    }
    mensaje += `. ¿Me podrías dar más detalles?`;
    
    return `https://api.whatsapp.com/send?phone=573100000000&text=${encodeURIComponent(mensaje)}`;
  }
}
