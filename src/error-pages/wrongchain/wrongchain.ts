import { autoinject } from "aurelia-framework";
import { Web3Service } from '../../services/Web3Service';

@autoinject
export class WrongChain {
    currentChain: string = Web3Service.Network;
}
