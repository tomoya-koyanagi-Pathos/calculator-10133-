import { Component, signal } from '@angular/core';
import { Test2 } from './test2/test2';


@Component({
  selector: 'app-root',
  imports: [Test2],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  protected readonly title = signal('my-exam1');
}

