export interface EventConfig {
  message: string;
  actionType: ActionType;
  action: () => void;
  actionText: string;
  /**
   * for when ActionType is address.
   */
  address: string;
  /**
   * "tx" or "address", when actionType is address.  Default is "address"
   */
  addressType: string;
  style: string;
  duration: Number; // in milliseconds, default 3000, 0 for never
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
