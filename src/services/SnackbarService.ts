import { autoinject } from "aurelia-framework";
import { EventAggregator  } from 'aurelia-event-aggregator';
import { DisposableCollection } from "./DisposableCollection";
import { LogManager } from 'aurelia-framework';
import 'snackbarjs';

@autoinject
export class SnackbarService {

  // probably doesn't really need to be a disposable collection since this is a singleton service
  subscriptions: DisposableCollection = new DisposableCollection();
  logger = LogManager.getLogger("Alchemy");
  timeout = 3000;

  constructor(
    eventAggregator: EventAggregator
  ) {
    this.subscriptions.push(eventAggregator.subscribe("handleException", (ex) => this.handleFailure(ex.message)));
    this.subscriptions.push(eventAggregator.subscribe("handleSuccess", (params) => this.handleSuccess(params)));
    this.subscriptions.push(eventAggregator.subscribe("handleWarning", (params) => this.handleWarning(params)));
    this.subscriptions.push(eventAggregator.subscribe("handleFailure", (params) => this.handleFailure(params)));
    this.subscriptions.push(eventAggregator.subscribe("showMessage", (params) => this.handleSuccess(params)));
  }

  public handleSuccess(message: string) {
    this.logger.info(message);
    (<any>$).snackbar({
      timeout: this.timeout,
      style: "snack-info",
      content: message,
      htmlAllowed: true
    });
  }

  public handleFailure(message: string) {
    this.logger.error(message);
    (<any>$).snackbar({
      timeout: this.timeout,
      style: "snack-failure",
      content: message,
      htmlAllowed: true
    });
  }

  public handleWarning(message: string) {
    this.logger.info(message);
    (<any>$).snackbar({
      timeout: this.timeout,
      style: "snack-warning",
      content: message,
      htmlAllowed: true
    });
  }
}
