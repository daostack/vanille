import { bindable, containerless, customElement, autoinject } from 'aurelia-framework';
import { Web3Service } from "../../../services/Web3Service";

@autoinject
@containerless
@customElement("ethbalance")
export class EthBalance {

  private ethBalance: string = '';
  private rawBalance: string = '';
  private ethAddress: string;
  private filter: any;
  private textElement: HTMLElement;

  constructor(private web3: Web3Service) {
    this.ethAddress = this.web3.defaultAccount;
  }

  text: string;

  attached() {
    this.readBalance().then(() => {
      (<any>$(this.textElement)).tooltip(
        {
          toggle: "tooltip",
          placement: "left",
          title: this.rawBalance,
          trigger: "hover"
        }
      )
    });
  }

  detached() {
    if (this.filter) {
      this.filter.stopWatching();
      this.filter = null;
    }
  }

  async readBalance() {
    /**
     * this is supposed to fire whenever a new block is created
     */
    this.filter = this.web3.eth.filter({ fromBlock: 'latest' }).watch(() => {
      this.getBalance();
    });
    return this.getBalance();
  }

  async getBalance() {
    try {
      const balance = this.web3.fromWei(await this.web3.getBalance(this.ethAddress));
      this.rawBalance = balance.toString(10);
      this.ethBalance = balance.toExponential(2);
      this.text = `${this.ethBalance} ETH`;
    } catch (ex) {
    }
  }
}
