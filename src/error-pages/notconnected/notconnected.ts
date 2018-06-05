import { autoinject } from "aurelia-framework";
import { Web3Service } from '../../services/Web3Service';
import { ConfigService } from '../../services/ArcService';

@autoinject
export class NotConnected {
  currentChain: string;
  currentLocation: string = window.location.origin;
  nodeUrl: string;
  nodePort: string;

  constructor(web3: Web3Service) {
    this.currentChain = web3.networkName;
    this.nodePort = ConfigService.get("providerPort");
    this.nodeUrl = `${ConfigService.get("providerUrl")}:${ConfigService.get("providerPort")}`;
  }
}
