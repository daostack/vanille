import { bindable, containerless, customElement, autoinject } from 'aurelia-framework';
import { Web3Service } from '../../../services/Web3Service';

@autoinject
@containerless
@customElement("etherscanlink")
export class EtherscanLink {
    constructor() {
        this.targetedNetwork = Web3Service.Network;
    }

    targetedNetwork: any;

    @bindable
    address: string;

    @bindable
    type: string;

    @bindable
    children:any;
}
