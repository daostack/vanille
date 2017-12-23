import { Observable} from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/fromPromise';

describe('Observables', () => {

  beforeEach(async () => {
  });


  it('can create an observable', () => {
    const observable = Observable.create();
    expect(observable).not.toBeNull();
  });

  it('can map an observable', () => {
    const observable = Observable.from([2]).map((o) => { return 1; });
    expect(observable).not.toBeFalsy();
  });

  it('can subscribe to an observable', () => {
    const observable = Observable.from([2]);
    expect(observable).not.toBeFalsy();
    observable.subscribe(
    {
      next: x => {
        console.log('Observer got a value: ' + x);
        expect(x).toBe(2);
      },
      error: err => {
        console.log('Observer got an error: ' + err);
        expect(true).toBeFalsy();
      },
      complete: () => {
        console.log('Observer got a complete notification')
        },
    });
  });

  it('can subscribe to an dynamic array of objects', () => {
    const subject = new Subject();
    expect(subject).not.toBeFalsy();

    subject.subscribe(
    {
      next: x => {
        console.log('Observer got a value: ' + x.name);
        expect(x.name).toBe("Gabrielle");
      },
      error: err => {
        console.log('Observer got an error: ' + err);
        expect(true).toBeFalsy();
      },
      complete: () => {
        console.log('Observer got a complete notification')
        },
    });

    subject.next({ name: "Gabrielle"});

  });

  it('can create a synchronous queue of promises', async () => {
    
    const input = new Subject();
    expect(input).not.toBeFalsy();
    const throttledInput = input
      .concatMap((x) => {
          return Observable.fromPromise(new Promise(function(resolve, reject) {
              setTimeout(() => {
                console.log('resolving to: ' + x);
                resolve(x);
              }, 1000);
          }));
        });

    expect(throttledInput).not.toBeFalsy();

    let count = 1;

    throttledInput.subscribe(
    {
      next: (x) => {
        console.log(`throttledInput emitted: ${x} at ${new Date().getSeconds()} seconds after the minute`);
        expect(x).toBe(count++);
      },
      error: (err) => {
        console.log('throttledInput generated an error: ' + err);
        expect(true).toBeFalsy();
      },
      complete: () => {
        console.log('throttledInput sent a complete notification')
        },
    });

    input.next(1);
    input.next(2);
    input.next(3);

    await new Promise((resolve) => setTimeout(resolve, 4000));
    
  });

  afterEach(() => {
  });
});
