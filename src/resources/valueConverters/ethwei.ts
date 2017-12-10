import { NumberService } from "../../services/numberService";
import {autoinject} from "aurelia-framework";
import { Web3Service, BigNumber } from "../../services/Web3Service";

/**
 * Convert between Wei (as BigNumber) in viewmodel to eth (as string) in view.
 * Note that even if the viewmodel supplies a number, modified values are saved back 
 * to the viewmodel as BigNumber.
 */
@autoinject
export class EthweiValueConverter {

    constructor(
      private numberService: NumberService,
      private web3: Web3Service) { }

    /**
     * Eth string to Wei BigNumber <==  NOTE you always end up with BigNumber in your model
     * 
     * When the string cannot be converted to a number, this will return the original string.
     * This helps the user see the original mistake.  Validation will need to make sure that the
     * incorrect value is not persisted.
     * @param value
     */
    fromView(value: string) : BigNumber {
        if ((value == undefined) || (value == null)) {
          return value;
        }

        // allow exceptions here so that corrupt data is let likely to make it into
        // a model
        return this.web3.toBigNumber(this.web3.toWei(value, "ether"));
    }

    /**
     *  Wei BigNumber|number to Eth string
     * @param value
     */
    toView(value: number|BigNumber, base:number= 10) : string {
      try {
        if ((value == undefined) || (value == null)) {
          return "";
        }

        return this.web3.fromWei(value, "ether").toString(base);
      } catch(ex) {
        return value.toString();
      }
    }
}
