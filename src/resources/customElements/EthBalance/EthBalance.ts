import { bindable, containerless, customElement, autoinject } from 'aurelia-framework';
import { Web3Service } from "../../../services/Web3Service";

@autoinject
@containerless
@customElement("ethbalance")
export class EthBalance {

  private ethBalance: string = '';
  private ethAddress: string;
  private filter: any;
  
  constructor(private web3: Web3Service) {
    this.ethAddress = this.web3.defaultAccount;
  }

  async attached() {
    this.readBalance();    
  }

  detached() {
    if (this.filter) {
      this.filter.stopWatching();
      this.filter = null;
    }
  }

  async readBalance() {
    this.getBalance();
    /**
     * Note I changed the first param from {} to latest to get this to work.  Dunno if that is the most efficient  -dkent
     */
    this.filter = this.web3.eth.filter('latest', async () => {
      this.getBalance();
    });
  }

  async getBalance() {
    try {
      this.ethBalance = (await this.web3.getBalance(this.ethAddress)).toFixed(2);
    } catch(ex) {
      console.log("EthBalance: failed to obtain eth balance");
    }
  }
}
