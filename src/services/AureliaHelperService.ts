import { IDisposable } from "./IDisposable";
import { BindingEngine, TemplatingEngine, autoinject, transient } from "aurelia-framework";
import { Container } from 'aurelia-dependency-injection';
import { Loader } from 'aurelia-loader';

@autoinject
export class AureliaHelperService {

  constructor(
    public container: Container,
    private bindingEngine: BindingEngine,
    private templatingEngine: TemplatingEngine,
    private loader: Loader
  ) {

  }
  /**
   * Create an observable property and subscribe to changes
   * @param object
   * @param propertyName
   * @param func
   */
  public createPropertyWatch(object: any, propertyName: string, func: (newValue: any, oldValue: any) => void): IDisposable {
    return this.bindingEngine.propertyObserver(object, propertyName)
      .subscribe((newValue, oldValue) => {
        func(newValue, oldValue);
      });
  }

  /**
   * Create an observable of array membership changes.
   * @param array 
   * @param func 
   */
  public createArrayWatch<T>(array: Array<T>, func: (splices: Array<CollectionChangeSplice<T>>) => void): IDisposable {
    return this.bindingEngine.collectionObserver(array)
      .subscribe((splices: Array<CollectionChangeSplice<T>>) => {
        func(splices);
      });
  }


  /**
   * Create a bindable property
   * @param object
   * @param propertyName
   */
  public createObservableProperty(object: any, propertyName: string): void {
    this.bindingEngine.propertyObserver(object, propertyName);
  }

  /**
   * create a observable computed property
   * @param object
   * @param propertyName
   */
  public createObservableComputedProperty<T>(object: any, propertyName: string, func: () => T, dependencies?: Array<string>): void {

    Object.defineProperty(object, propertyName, { get: func });

    // todo: test that this truly does avoid polling
    if (dependencies) {
      object.get.dependencies = dependencies;
    }

    this.createObservableProperty(object, propertyName);
  }

  /**
   * get instance from dependency injection from the given container
   * @param whateverClass class to instantiate
   */
  public getInstanceOf(whateverClass: any): any {
    return this.container.get(whateverClass);
  }

  /**
   * return whether an instance has already been registered (or retrieved) in the container.
   * @param whateverClass class to instantiate
   */
  public instanceIsRegistered(whateverClass: any, container?: Container, checkParent?: boolean): any {
    if (!container) {
      container = this.container;
    }
    return container.hasResolver(whateverClass, checkParent);
  }

  /**
   * Creates a new instance from the current scope and registers it
   * in the container so that it will be available to others using the
   * same container.  This is a way to make something a singleton within
   * a given scope.  Since views are in their own child container, then
   * this can be useful to scope otherwise-singleton objects within a view (without using @singleton(true)).
   */
  public createForCurrentScope(whateverClass: any, registerAs: any): any {
    var instance = this.getInstanceOf(whateverClass);
    this.container.registerInstance(registerAs ? registerAs : whateverClass, instance);
    return instance;
  }

  /**
   * bind the html element located by the path given by elementSelector.
   * @param elementSelector
   * @param bindingContext -- The viewmodel against which the binding should run
   */
  public enhance(elementSelector: string, bindingContext: any): void {
    let el = document.querySelector(elementSelector);
    this.enhanceElement(el, bindingContext);

  }

  public enhanceElement(el: Element, bindingContext: any): void {
    if (el) {
      if (!el.querySelectorAll('.au-target').length) { // otherwise we would be rebinding something that has already been bound
        this.templatingEngine.enhance({ element: el, bindingContext: bindingContext });
      }
    }
  }

  public async viewExists(moduleId: any) {
    let result = false;

    try {
      result = !!await this.loader.loadModule(moduleId);
    }
    catch (e) {
    }
    return result;
  }
}

export interface CollectionChangeSplice<T> {
  addedCount: number;
  index: number;
  removed?: Array<T>
}
