import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/services/admin.service';
import Chart from 'chart.js/auto';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CurrencyPipe } from '@angular/common';

@Component({
    selector: 'app-inicio',
    templateUrl: './inicio.component.html',
    styleUrls: ['./inicio.component.css'],
    imports: [SidebarComponent, CurrencyPipe]
})
export class InicioComponent implements OnInit {

  public token;
  public total_ganancia = 0;
  public total_mes = 0;
  public total_mes_anterior = 0;
  public count_ventas = 0;
  ///////////
  constructor(
    private _adminService: AdminService,
    private _router: Router
  ) {
    this.token = localStorage.getItem('token');
  }

  ngOnInit(): void {
    const role = this._adminService.getRole();
    if (!role) {
      this._router.navigate(['/login']);
      return;
    }
    if (!['admin', 'direccion', 'finanzas'].includes(role)) {
      let target = '/panel/clientes';
      if (role === 'compras' || role === 'logistica') {
        target = '/panel/pedidos';
      } else if (role === 'soporte') {
        target = '/panel/chat';
      }
      this._router.navigate([target]);
      return;
    }
    this.init_data();
  }

  init_data() {
    this._adminService.kpi_ganancias_mensuales_admin(this.token).subscribe(
      response => {
        this.total_ganancia = response.total_ganancia;
        this.total_mes = response.total_mes;
        this.count_ventas = response.count_ventas;
        this.total_mes_anterior = response.total_mes_anterior;

        var canvas = <HTMLCanvasElement>document.getElementById('myChart');
        var ctx = canvas.getContext('2d');
        var myChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Dicembre'],
            datasets: [{
              label: 'Meses',
              data: [response.enero,
              response.febrero,
              response.marzo,
              response.abril,
              response.mayo,
              response.junio,
              response.julio,
              response.agosto,
              response.septiembre,
              response.octubre,
              response.noviembre,
              response.diciembre,
              ],
              backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
              ],
              borderWidth: 1
            }]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }
    );
  }

}
