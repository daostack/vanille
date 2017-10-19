import { autoinject } from "aurelia-framework";
import { Web3Service } from '../../services/Web3Service';

@autoinject
export class NotConnected {
    currentChain: string = Web3Service.Network;
    currentLocation: string = window.location.origin;
}
