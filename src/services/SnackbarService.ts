import { autoinject } from "aurelia-framework";
import { EventAggregator  } from 'aurelia-event-aggregator';
import { DisposableCollection } from "./DisposableCollection";
import { LogManager } from 'aurelia-framework';
import 'snackbarjs';

  /**
   * TODO:  Show queue up simultaneous messages so they are shown sequentially
   */
@autoinject
export class SnackbarService {

  // probably doesn't really need to be a disposable collection since this is a singleton service
  subscriptions: DisposableCollection = new DisposableCollection();
  logger = LogManager.getLogger("Alchemy");
  timeout = 0; // 0 means user must dismiss by clicking on it
  htmlAllowed: true;

  constructor(
    eventAggregator: EventAggregator
  ) {
    this.subscriptions.push(eventAggregator.subscribe("handleException", (ex) => this.handleException(ex)));
    this.subscriptions.push(eventAggregator.subscribe("handleSuccess", (message) => this.handleSuccess(message)));
    this.subscriptions.push(eventAggregator.subscribe("handleWarning", (message) => this.handleWarning(message)));
    this.subscriptions.push(eventAggregator.subscribe("handleFailure", (message) => this.handleFailure(message)));
    this.subscriptions.push(eventAggregator.subscribe("showMessage", (message) => this.handleSuccess(message)));
  }

  public handleSuccess(message: string) {
    this.logger.debug(message);
    (<any>$).snackbar({
      timeout: this.timeout,
      style: "snack-info",
      content: message,
      htmlAllowed: this.htmlAllowed
    });
  }

  public handleException(ex) {
    let message = ex.message ? ex.message : ex;
    this.logger.error(`${message}${ex.stack ? `\n${ex.stack}` : ""}`);
    (<any>$).snackbar({
      timeout: this.timeout,
      style: "snack-failure",
      content: message,
      htmlAllowed: this.htmlAllowed
    });
  }

  public handleFailure(message: string) {
    this.logger.error(message);
    (<any>$).snackbar({
      timeout: this.timeout,
      style: "snack-failure",
      content: message,
      htmlAllowed: this.htmlAllowed
    });
  }

  public handleWarning(message: string) {
    this.logger.debug(message);
    (<any>$).snackbar({
      timeout: this.timeout,
      style: "snack-warning",
      content: message,
      htmlAllowed: this.htmlAllowed
    });
  }
}
