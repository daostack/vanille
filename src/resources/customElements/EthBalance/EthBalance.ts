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

  attached() {
    this.readBalance();    
  }

  detached() {
    if (this.filter) {
      this.filter.stopWatching();
      this.filter = null;
    }
  }

  readBalance() {
    /**
     * TODO:  is suspicious or at least inefficient, how it is getting the balance multiple times.  
     * Need to commment or improve. --dkent
     * 
     * TODO:  are these asynchronous? Can we return a promise here? --dkent
     */
    this.web3.getBalance(this.ethAddress, (error, res) => {
      if (!error) {
        this.ethBalance = Number(this.web3.fromWei(res)).toFixed(2);
      }
    });

    /**
     * Note I changed the first param from {} to latest to get this to work.  Dunno if that is the most efficient  -dkent
     */
    this.filter = this.web3.eth.filter('latest', () => {
     this.web3.getBalance(this.ethAddress, (error, res) => {
        if (!error) {
          this.ethBalance = Number(this.web3.fromWei(res)).toFixed(2);
        }
      })
    });
  }
}
