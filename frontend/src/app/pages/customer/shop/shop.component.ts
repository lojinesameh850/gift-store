import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgFor } from '@angular/common';
import { ProductCardComponent } from '../../../components/product-card/product-card.component';

@Component({
  selector: 'app-shop',
  imports: [NgFor, ProductCardComponent],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css'
})
export class ShopComponent implements OnInit {

  tags: any[] = [];
  selectedTags: string[] = [];
  products: any[] = [];

  private http = inject(HttpClient);

  ngOnInit() {
    this.fetchTags();
  }

  fetchTags() {
    const apiUrl = 'http://localhost:5000/api/tags';
    this.http.get<any>(apiUrl).subscribe({
      next: (res) => {
        // backend responds with { success, count, data }
        this.tags = res?.data ?? res ?? [];
        console.log('Tags loaded:', this.tags);
      },
      error: (error) => {
        if (error?.status === 401) {
          console.error('Error fetching tags: Unauthorized. Backend returned 401.');
        } else {
          console.error('Error fetching tags:', error);
        }
      }
    });
  }


  onTagSelect(event: Event, tag: any) {
    const isChecked = (event.target as HTMLInputElement).checked;
    const tagId = tag._id || tag.id;

    if (isChecked) {
      this.selectedTags.push(tagId);
    } else {
      this.selectedTags = this.selectedTags.filter(id => id !== tagId);
    }

    console.log('Selected Tags:', this.selectedTags);
  }

}
