import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { ProductoService } from 'src/app/services/producto.service';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { NgIf, NgFor, NgClass, SlicePipe, DatePipe } from '@angular/common';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-reviews-producto',
    templateUrl: './reviews-producto.component.html',
    styleUrls: ['./reviews-producto.component.css'],
    imports: [SidebarComponent, RouterLink, NgIf, NgFor, NgClass, NgbPagination, SlicePipe, DatePipe]
})
export class ReviewsProductoComponent implements OnInit {

  public id;
  public token;
  public _iduser;
  public producto: any = {};
  public reviews: Array<any> = [];
  public url;
  public load_btn = false;

  public page = 1;
  public pageSize = 15;

  constructor(
    private _route: ActivatedRoute,
    private _productoService: ProductoService
  ) {
    this.token = localStorage.getItem('token');
    this._iduser = localStorage.getItem('_id');
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    this._route.params.subscribe(
      params => {
        this.id = params['id'];


        this._productoService.obtener_producto_admin(this.id, this.token).subscribe(
          response => {
            if (response.data == undefined) {
              this.producto = undefined;
            } else {
              this.producto = response.data;

              this._productoService.obtener_reviews_producto_publico(this.producto._id).subscribe(
                response => {
                  this.reviews = response.data;
                }
              );
            }

          },
          error => {

          }
        );

      }
    );
  }

}
