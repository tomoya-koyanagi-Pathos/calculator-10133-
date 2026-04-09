import { Component, signal } from '@angular/core';
import { test1Component } from './test1/test1';
import { Test2 } from './test2/test2';
import { Test3 } from './test3/test3';


@Component({
  selector: 'app-root',
  imports: [test1Component,Test2,Test3],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  protected readonly title = signal('my-exam1');
}

