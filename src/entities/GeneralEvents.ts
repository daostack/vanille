export class EventConfig {
  constructor(
    public message: string
    , type: EventMessageType = EventMessageType.Info
    , lifetime: SnackLifetime = SnackLifetime.transitory
  ) {

    switch (lifetime) {
      case SnackLifetime.clickToDismiss:
      case SnackLifetime.closeButton:
        this.duration = 0;
        break;
      case SnackLifetime.transitory:
        this.duration = 3000;
        break;
      case SnackLifetime.none:
        this.duration = -1; // means no snack
        break;
    }

    switch (type) {
      case EventMessageType.Info:
      case EventMessageType.Debug:
      default:
        this.style = "snack-info";
        break;
      case EventMessageType.Warning:
        this.style = "snack-warning";
        break;
      case EventMessageType.Failure:
      case EventMessageType.Exception:
        this.style = "snack-failure";
        break;
    }
  }

  public style: string = "snack-info";
  /**
   * in milliseconds, default 3000, 0 for never
   */
  public duration: Number = 3000;
  public actionType: ActionType = ActionType.none;

  public action: () => void;
  public actionText: string;
  /**
   * for when ActionType is address.
   */
  public address: string;
  /**
   * "tx" or "address", when actionType is address.  Default is "address"
   */
  public addressType: string;
  /**
   * for when action is Exception
   */
  public exception: any;
}

export class EventConfigFailure extends EventConfig {
  constructor(
    message: string = "An error occurred"
    , type: EventMessageType = EventMessageType.Failure
    , lifetime: SnackLifetime = SnackLifetime.closeButton
  ) {
    super(message, type, lifetime);
    this.message = `${this.message}`;
  }
}

export class EventConfigException extends EventConfig {
  constructor(
    message: string = "An error occurred"
    , public exception: any
    , type: EventMessageType = EventMessageType.Exception
    , lifetime: SnackLifetime = SnackLifetime.closeButton
  ) {
    super(message, type, lifetime);
    this.message = `${this.message}: ${exception}`;
  }
}

export class EventConfigAction extends EventConfig {
  constructor(
    message: string
    /**
     * text for control
     */
    , public actionText: string
    /**
     * called when control is clicked
     */
    , public action: () => void
    , type: EventMessageType = EventMessageType.Info
    , lifetime: SnackLifetime = SnackLifetime.clickToDismiss
  ) {
    super(message, type, lifetime);
    this.actionType = ActionType.button;
  }
}

export class EventConfigAddress extends EventConfig {
  constructor(
    message: string
    , public address: string
    /**
     * text to display instead of address
     */
    , public actionText: string
    , type: EventMessageType = EventMessageType.Info
    , lifetime: SnackLifetime = SnackLifetime.clickToDismiss
  ) {
    super(message, type, lifetime);
    this.actionType = ActionType.address;
    this.addressType = "address";
  }
}

export class EventConfigTransaction extends EventConfigAddress {
  constructor(
    message: string
    , public address: string
    /**
     * text to display instead of address
     */
    , public actionText: string = "See Transaction"
    , type: EventMessageType = EventMessageType.Info
    , lifetime: SnackLifetime = SnackLifetime.clickToDismiss
  ) {
    super(message, address, actionText, type, lifetime);
    this.actionType = ActionType.address;
    this.addressType = "tx";
  }
}

export enum ActionType {
  none = 0,
  /**
   * provide action for onclick
   */
  button = 1,
  /**
   * actionText is an address, make it hot/copyable
   */
  address = 2
}

export enum SnackLifetime {
  none = 0,
  transitory = 1,
  clickToDismiss = 2,
  closeButton = 3
}

export enum EventMessageType {
  none = 0,
  Failure = 1,
  Exception = 1,
  Warning = 2,
  Info = 3,
  Debug = 4
}
