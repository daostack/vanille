import { autoinject } from "aurelia-framework";
import { EventAggregator  } from 'aurelia-event-aggregator';
import { DisposableCollection } from "./DisposableCollection";
import { LogManager } from 'aurelia-framework';
import { EventConfig } from "../entities/GeneralEvents";

@autoinject
export class ConsoleLogService {

  // probably doesn't really need to be a disposable collection since this is a singleton service
  subscriptions: DisposableCollection = new DisposableCollection();
  logger = LogManager.getLogger("Alchemy");

  constructor(
    eventAggregator: EventAggregator
  ) {
    this.subscriptions.push(eventAggregator.subscribe("handleException", (ex) => this.handleException(ex)));
    this.subscriptions.push(eventAggregator.subscribe("handleSuccess", (config: EventConfig | string) => this.handleSuccess(config)));
    this.subscriptions.push(eventAggregator.subscribe("handleWarning", (config: EventConfig | string) => this.handleWarning(config)));
    this.subscriptions.push(eventAggregator.subscribe("handleFailure", (config: EventConfig | string) => this.handleFailure(config)));
    // this.subscriptions.push(eventAggregator.subscribe("showMessage", (config: EventConfig | string) => this.showMessage(config)));
  }

  /* shouldn't actually ever happen */
  dispose() {
    this.subscriptions.dispose();
  }

  public showMessage(config: EventConfig | string) {
    this.logger.info(this.getMessage(config));
  }

  public handleSuccess(config: EventConfig | string) {
    this.logger.debug(this.getMessage(config));
  }

  public handleException(ex) {
    let message = ex.message ? ex.message : ex;
    this.logger.error(`${message}${ex.stack ? `\n${ex.stack}` : ""}`);
  }

  public handleFailure(config: EventConfig | string) {
    this.logger.error(this.getMessage(config));
  }

  public handleWarning(config: EventConfig | string) {
    this.logger.debug(this.getMessage(config));
  }

  private getMessage(config: EventConfig | string): string {
      return (typeof(config) == "string") ? config : config.message;
  }
}
