// health-check.component.ts
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
 import { takeWhile } from 'rxjs/operators';
@Component({
  selector: 'app-health-check',
  templateUrl: './health-check.component.html',
  styleUrls: ['./health-check.component.css'],
})

export class HealthCheckComponent implements OnInit, OnDestroy {
  statusMessage = 'Checking server status...';
  loading = true;
  private subscription?: Subscription;

  @Output() isLoading = new EventEmitter<boolean>();

  private healthCheckUrl = 'https://indirecteffectscausality-webapi.onrender.com/api/healthcheck';

  constructor(private http: HttpClient) {}

 

ngOnInit() {
    this.isLoading.emit(true);
   this.subscription = interval(5000)
  .pipe(
    switchMap(() =>
      this.http.get<{ status: string }>(this.healthCheckUrl).pipe(
        catchError(() => of(null))
      )
    )
  )
  .subscribe(response => {
    if (response && response.status === 'alive') {
      this.statusMessage = `Server is UP: ${response.status}`;
      this.loading = false;
      this.isLoading.emit(false);
      this.subscription?.unsubscribe();
    } else {
      this.statusMessage = 'Server is still down, retrying...';
      this.loading = true;
      this.isLoading.emit(true);
    }
  });
  }


  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
