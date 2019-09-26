import {Component, OnDestroy, ViewChild} from '@angular/core';
import {fromEvent, interval, of, Subscription} from 'rxjs';
import {catchError, take, takeWhile, timeout} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnDestroy {

  public time = 0;

  private isStopped = true;
  private isWaitPressed = false;
  private countSubscription = new Subscription();

  @ViewChild('waitBtn') btn;

  private count(): Subscription {
    return interval(1000).pipe(
        takeWhile(() => !this.isStopped)
      ).subscribe(() => this.time += 1000);
  }

  public start(): void {
    this.isStopped = !this.isStopped;
    this.countSubscription.unsubscribe();
    this.countSubscription = this.count();
  }

  public wait(): void {
    if (this.isWaitPressed) {
      return;
    }

    this.isWaitPressed = true;

    fromEvent(this.btn.nativeElement, 'click')
      .pipe(
        timeout(300),
        take(1),
        catchError(err => of(null))
      )
      .subscribe(event => {
        if (event) {
          this.isStopped = true;
        }
        this.isWaitPressed = false;
      });
  }

  public reset(): void {
    this.time = 0;
  }

  public formatTime(distance: number): string {
    const hours = ('0' + Math.floor(distance / 1000 / 60 / 60)).slice(-2);
    const minutes = ('0' + Math.floor(distance / 1000 / 60) % 60).slice(-2);
    const seconds = ('0' + Math.floor(distance / 1000) % 60).slice(-2);
    return `${hours}:${minutes}:${seconds}`;
  }

  public ngOnDestroy(): void {
    this.countSubscription.unsubscribe();
  }
}
