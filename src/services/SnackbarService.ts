import { autoinject } from "aurelia-framework";
import { EventAggregator  } from 'aurelia-event-aggregator';
import { DisposableCollection } from "./DisposableCollection";
// import { LogManager } from 'aurelia-framework';
import { AureliaHelperService } from "./AureliaHelperService";
import { EventConfig, ActionType } from "../entities/GeneralEvents";
import 'snackbarjs';

  /**
   * TODO:  Ability to queue up simultaneous messages so they are shown sequentially (per Material Design spec)
   */
@autoinject
export class SnackbarService {

  // probably doesn't really need to be a disposable collection since this is a singleton service
  subscriptions: DisposableCollection = new DisposableCollection();
  // logger = LogManager.getLogger("Alchemy");

  constructor(
    eventAggregator: EventAggregator
    , private aureliaHelperService: AureliaHelperService
  ) {
    this.subscriptions.push(eventAggregator.subscribe("handleException", (ex) => this.handleException(ex)));
    this.subscriptions.push(eventAggregator.subscribe("handleSuccess", (config: EventConfig | string) => this.handleSuccess(config)));
    this.subscriptions.push(eventAggregator.subscribe("handleWarning", (config: EventConfig | string) => this.handleWarning(config)));
    this.subscriptions.push(eventAggregator.subscribe("handleFailure", (config: EventConfig | string) => this.handleFailure(config)));
    this.subscriptions.push(eventAggregator.subscribe("showMessage", (config: EventConfig | string) => this.showMessage(config)));
  }

  /* shouldn't actually ever happen */
  dispose() {
    this.subscriptions.dispose();
  }

  public showMessage(config: EventConfig | string) {
    // this.logger.info(message);
    this.serveSnack(config);
  }

  public handleSuccess(config: EventConfig | string) {
    // this.logger.debug(message);
    this.serveSnack(config);
  }

  public handleException(ex) {
    let message = ex.message ? ex.message : ex;
    // this.logger.error(`${message}${ex.stack ? `\n${ex.stack}` : ""}`);
    this.serveSnack(message);
  }

  public handleFailure(config: EventConfig | string) {
    // this.logger.error(message);
    this.serveSnack(config);
  }

  public handleWarning(config: EventConfig | string) {
    // this.logger.debug(message);
    this.serveSnack(config);
  }

  private serveSnack(config: EventConfig | string, defaults: any = {}) {
    let completeConfig = this.completeConfig(config,defaults);

    let $snackbar = (<any>$).snackbar(this.getSnackbarConfig(completeConfig));

    // for actions, but this means you can put binding code in the message too, 
    // where the config is the bindingContext
    this.aureliaHelperService.enhanceElement($snackbar[0], completeConfig);
  }

  completeConfig(config: EventConfig | string, defaults: any = {} ): EventConfig {
      if (typeof(config) == "string") {
        config = { message: config as string } as EventConfig;
      }

      return Object.assign({ style: "snack-info", duration: 3000, actionType: ActionType.none }, defaults, config);
  }

  getSnackbarConfig(config: EventConfig) {
    return {
      content: this.formatContent(config),
      style: config.style,
      timeout: config.duration,
      htmlAllowed: true
    }
  }
  
  formatContent(config: EventConfig) {
    let templateMessage = `<span class="snackbar-message-text">${config.message}</span>`;
    let templateAction="";
    switch (config.actionType) {
      case ActionType.address:
        templateAction = `<span class="snackbar-action-wrapper"><etherscanlink address="${config.address}" type="${config.addressType || 'address'}">${config.actionText || config.address}</etherscanlink></span>`;
      break;
      case ActionType.button:
        templateAction = `<span class="snackbar-action-wrapper"><button type="button" class="btn" click.delegate='action()'>${config.actionText}</button></span>`;
      break;
    }
    return `${templateMessage}${templateAction}`;
  }
}
