import { bindable, containerless, customElement, autoinject } from 'aurelia-framework';
import { Web3Service } from '../../../services/Web3Service';

@containerless
@autoinject
@customElement("etherscanlink")
export class EtherscanLink {

  @bindable
  address: string;

  @bindable
  text?: string;

  @bindable
  type: string;

  isGanache: boolean;


  clipbutton: HTMLElement;

  networkExplorerUri: string;

  constructor() {
    const targetedNetwork = Web3Service.Network;
    this.isGanache = targetedNetwork === "ganache";
    this.networkExplorerUri = `http://${targetedNetwork}.etherscan.io`;
  }
}
