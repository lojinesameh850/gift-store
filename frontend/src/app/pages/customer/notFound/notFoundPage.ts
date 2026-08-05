import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './notFoundPage.html',
  styleUrls: ['./notFoundPage.css']
})
export class notFoundComponent {}
