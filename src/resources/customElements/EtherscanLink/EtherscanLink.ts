import { bindable, customElement, autoinject } from 'aurelia-framework';
import { Web3Service } from '../../../services/Web3Service';

@autoinject
@customElement("etherscanlink")
export class EtherscanLink {

  @bindable
  address: string;

  @bindable
  text?: string;

  @bindable
  type: string;

  /**
   * set add classes on the text
   */
  @bindable
  css: string;

  clipbutton: HTMLElement;

  networkExplorerUri: string;

  copyMessage: string;

  internal: boolean = false;

  constructor(private web3: Web3Service) {
  }

  attached() {
    let targetedNetwork = this.web3.networkName;
    if (targetedNetwork === "Live") {
      targetedNetwork = "";
    }
    const isGanache = targetedNetwork === "Ganache";
    if (this.type == "tx") {
      this.copyMessage = "Hash has been copied to the clipboard";
    } else {
      this.copyMessage = "Address has been copied to the clipboard";
    }

    if (isGanache) {
      if (this.type === "tx") {
        this.internal = true;
        this.networkExplorerUri = `/#/txInfo/${this.address}`;
      }
    } else {
      // go with etherscan
      this.networkExplorerUri = `http://${targetedNetwork}.etherscan.io/${this.type === "tx" ? "tx" : "address"}/${this.address}`;
    }
  }
}
