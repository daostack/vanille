import { autoinject } from "aurelia-framework";

/**
 * convert between boolean and string
 */
@autoinject
export class BooleanValueConverter {

  /**
   * boolean to string
   * @param val 
   */
  fromView(val: string,
    as: { true: string, false: string, default: string } = { true: "Yes", false: "No", default: "?" })
    : boolean | undefined {

    if ((val === undefined) || (val === null) || (val == as.default)) {
      return undefined;
    }

    return (val === as.true) ? true : (val === as.false) ? false : undefined;
  }

  /**
   * string to boolean
   * @param val
   */
  toView(val: boolean,
    as: { true: string, false: string, default: string } = { true: "Yes", false: "No", default: "?" })
    : string {

    if ((val === undefined) || (val === null)) {
      return as.default;
    }

    return val ? as.true : as.false;
  }
}
