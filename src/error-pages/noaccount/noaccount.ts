import { autoinject } from "aurelia-framework";
import { Web3Service } from '../../services/Web3Service';

@autoinject
export class WrongChain {
  currentChain: string;

  constructor(web3: Web3Service) {
    this.currentChain = web3.networkName;
  }
}
