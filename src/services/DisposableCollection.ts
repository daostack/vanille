import { transient } from "aurelia-framework";
import { IDisposable } from "./IDisposable";

@transient()
export class DisposableCollection implements IDisposable {


  private _disposables: Array<IDisposable>;

  constructor() {
    this._disposables = new Array<IDisposable>();
  }

  public emptyAndDispose(): void {
    this.dispose();
    // gotta make sure there are no more references to items (setting length = 0 still shows items in the debugger)
    while (this._disposables.length) {
      this._disposables.pop();
    }
  }

  public push(disposable: IDisposable): number {
    return this._disposables.push(disposable);
  }

  public dispose(): void {
    for (let disposable of this._disposables) {
      disposable.dispose();
    }
  }
}
