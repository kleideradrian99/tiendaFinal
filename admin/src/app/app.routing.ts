import { Routes, RouterModule } from "@angular/router";
import { ModuleWithProviders } from "@angular/core";
import { InicioComponent } from "./components/inicio/inicio.component";
import { LoginComponent } from "./components/login/login.component";

import { AdminGuard } from "./guards/admin.guard";
import { IndexClienteComponent } from "./components/clientes/index-cliente/index-cliente.component";
import { CreateClienteComponent } from "./components/clientes/create-cliente/create-cliente.component";
import { EditClienteComponent } from "./components/clientes/edit-cliente/edit-cliente.component";
import { CreateProductoComponent } from "./components/productos/create-producto/create-producto.component";
import { IndexProductoComponent } from "./components/productos/index-producto/index-producto.component";
import { UpdateProductoComponent } from "./components/productos/update-producto/update-producto.component";
import { InventarioProductoComponent } from "./components/productos/inventario-producto/inventario-producto.component";
import { CreateCuponComponent } from "./components/cupones/create-cupon/create-cupon.component";
import { IndexCuponComponent } from "./components/cupones/index-cupon/index-cupon.component";
import { UpdateCuponComponent } from "./components/cupones/update-cupon/update-cupon.component";
import { ConfigComponent } from "./components/config/config.component";
import { VariedadProductoComponent } from "./components/productos/variedad-producto/variedad-producto.component";
import { GaleriaProductoComponent } from "./components/productos/galeria-producto/galeria-producto.component";
import { IndexDescuentoComponent } from "./components/descuento/index-descuento/index-descuento.component";
import { CreateDescuentoComponent } from "./components/descuento/create-descuento/create-descuento.component";
import { EditDescuentoComponent } from "./components/descuento/edit-descuento/edit-descuento.component";
import { IndexContactoComponent } from "./components/contacto/index-contacto/index-contacto.component";
import { IndexVentasComponent } from "./components/ventas/index-ventas/index-ventas.component";
import { DetalleVentasComponent } from "./components/ventas/detalle-ventas/detalle-ventas.component";
import { ReviewsProductoComponent } from "./components/productos/reviews-producto/reviews-producto.component";
import { IndexPedidosComponent } from "./components/pedidos/index-pedidos/index-pedidos.component";
import { CreatePedidoComponent } from "./components/pedidos/create-pedido/create-pedido.component";
import { EditPedidoComponent } from "./components/pedidos/edit-pedido/edit-pedido.component";

import { IndexUsuario } from "./components/usuarios/index-usuario/index-usuario";
import { CreateUsuario } from "./components/usuarios/create-usuario/create-usuario";
import { EditUsuario } from "./components/usuarios/edit-usuario/edit-usuario";
import { RecuperarContrasenaAdmin } from "./components/login/recuperar-contrasena-admin/recuperar-contrasena-admin";

const appRoute: Routes = [
    { path: '', redirectTo: 'inicio', pathMatch: 'full' },
    { path: 'inicio', component: InicioComponent, canActivate: [AdminGuard], data: { roles: ['admin', 'asesora', 'direccion', 'finanzas', 'compras', 'logistica', 'soporte'] } },

    {
        path: 'panel', children: [
            { path: 'clientes', component: IndexClienteComponent, canActivate: [AdminGuard], data: { roles: ['admin', 'asesora', 'direccion'] } },
            { path: 'clientes/registro', component: CreateClienteComponent, canActivate: [AdminGuard], data: { roles: ['admin', 'asesora', 'direccion'] } },
            { path: 'clientes/:id', component: EditClienteComponent, canActivate: [AdminGuard], data: { roles: ['admin', 'asesora', 'direccion'] } },

            { path: 'productos/registro', component: CreateProductoComponent, canActivate: [AdminGuard], data: { roles: ['admin', 'direccion', 'compras'] } },
            { path: 'productos', component: IndexProductoComponent, canActivate: [AdminGuard], data: { roles: ['admin', 'direccion', 'compras'] } },
            { path: 'productos/:id', component: UpdateProductoComponent, canActivate: [AdminGuard], data: { roles: ['admin', 'direccion', 'compras'] } },
            { path: 'productos/inventario/:id', component: InventarioProductoComponent, canActivate: [AdminGuard], data: { roles: ['admin', 'direccion', 'compras'] } },
            { path: 'productos/variedades/:id', component: VariedadProductoComponent, canActivate: [AdminGuard], data: { roles: ['admin', 'direccion', 'compras'] } },
            { path: 'productos/galeria/:id', component: GaleriaProductoComponent, canActivate: [AdminGuard], data: { roles: ['admin', 'direccion', 'compras'] } },
            { path: 'productos/reviews/:id', component: ReviewsProductoComponent, canActivate: [AdminGuard], data: { roles: ['admin', 'direccion', 'compras'] } },

            { path: 'pedidos', component: IndexPedidosComponent, canActivate: [AdminGuard], data: { roles: ['admin', 'asesora', 'direccion', 'compras', 'logistica'] } },
            { path: 'pedidos/registro', component: CreatePedidoComponent, canActivate: [AdminGuard], data: { roles: ['admin', 'asesora', 'direccion', 'compras', 'logistica'] } },
            { path: 'pedidos/:id', component: EditPedidoComponent, canActivate: [AdminGuard], data: { roles: ['admin', 'asesora', 'direccion', 'compras', 'logistica'] } },

            { path: 'cupones/registro', component: CreateCuponComponent, canActivate: [AdminGuard], data: { roles: ['admin', 'direccion'] } },
            { path: 'cupones', component: IndexCuponComponent, canActivate: [AdminGuard], data: { roles: ['admin', 'direccion'] } },
            { path: 'cupones/:id', component: UpdateCuponComponent, canActivate: [AdminGuard], data: { roles: ['admin', 'direccion'] } },

            { path: 'descuentos', component: IndexDescuentoComponent, canActivate: [AdminGuard], data: { roles: ['admin', 'direccion'] } },
            { path: 'descuentos/registro', component: CreateDescuentoComponent, canActivate: [AdminGuard], data: { roles: ['admin', 'direccion'] } },
            { path: 'descuentos/:id', component: EditDescuentoComponent, canActivate: [AdminGuard], data: { roles: ['admin', 'direccion'] } },

            { path: 'configuraciones', component: ConfigComponent, canActivate: [AdminGuard], data: { roles: ['admin'] } },

            { path: 'ventas', component: IndexVentasComponent, canActivate: [AdminGuard], data: { roles: ['admin', 'finanzas', 'direccion'] } },
            { path: 'ventas/:id', component: DetalleVentasComponent, canActivate: [AdminGuard], data: { roles: ['admin', 'finanzas', 'direccion'] } },

            { path: 'contactos', component: IndexContactoComponent, canActivate: [AdminGuard], data: { roles: ['admin', 'asesora', 'soporte'] } },

            { path: 'usuarios', component: IndexUsuario, canActivate: [AdminGuard], data: { roles: ['admin'] } },
            { path: 'usuarios/registro', component: CreateUsuario, canActivate: [AdminGuard], data: { roles: ['admin'] } },
            { path: 'usuarios/:id', component: EditUsuario, canActivate: [AdminGuard], data: { roles: ['admin'] } },
        ]
    },

    { path: 'login', component: LoginComponent },
    { path: 'recuperar-contrasena', component: RecuperarContrasenaAdmin },
    { path: 'restablecer-contrasena/:token', component: RecuperarContrasenaAdmin }
];

export const appRoutingPorviders: any[] = [];
export const routing: ModuleWithProviders<any> = RouterModule.forRoot(appRoute);
