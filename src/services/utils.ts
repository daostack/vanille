import { fnVoid } from 'services/ArcService';
import { BlockWithoutTransactionData, Web3 } from 'web3';

export class Utils {
  public static sleep(milliseconds: number): Promise<any> {
    return new Promise((resolve: fnVoid): any => setTimeout(resolve, milliseconds));
  }

  public static getObjectKeys(obj: any): Array<string> {
    let temp = [];
    for (let prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        temp.push(prop);
      }
    }
    return temp;
  }

  /**
   * Returns the last mined block in the chain.
   */
  public static async lastBlockDate(web3: Web3): Promise<Date> {
    const block = await (<any>Promise).promisify((callback: any): any =>
      web3.eth.getBlock("latest", callback))() as BlockWithoutTransactionData;
    return new Date(block.timestamp * 1000);
  }

}
