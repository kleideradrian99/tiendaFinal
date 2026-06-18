import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';
import { NavComponent } from '../../../nav/nav.component';
import { SiderbarComponent } from '../../siderbar/siderbar.component';
import { NgIf, NgFor, NgClass, SlicePipe, DatePipe } from '@angular/common';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { FooterComponent } from '../../../footer/footer.component';

@Component({
    selector: 'app-index-review',
    templateUrl: './index-review.component.html',
    styleUrls: ['./index-review.component.css'],
    imports: [NavComponent, RouterLink, SiderbarComponent, NgIf, NgFor, NgClass, NgbPagination, FooterComponent, SlicePipe, DatePipe]
})
export class IndexReviewComponent implements OnInit {

  public token;
  public url;
  public reviews: Array<any> = [];
  public load_data = true;

  public page = 1;
  public pageSize = 15;



  constructor(
    private _clienteService: ClienteService
  ) {
    this.token = localStorage.getItem('token');
  }

  ngOnInit(): void {
    this._clienteService.obtener_reviews_cliente(localStorage.getItem('_id'), this.token).subscribe(
      response => {
        this.reviews = response.data;
        this.load_data = false;
      }
    );;
  }


}
