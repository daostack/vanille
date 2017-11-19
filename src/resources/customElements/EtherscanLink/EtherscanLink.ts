import { bindable, containerless, customElement, autoinject } from 'aurelia-framework';
import { Web3Service } from '../../../services/Web3Service';

@containerless
@autoinject
@customElement("etherscanlink")
export class EtherscanLink {
    
    targetedNetwork: any;

    @bindable
    address: string;

    @bindable
    type: string;

    clipbutton: HTMLElement;

    // @bindable
    // children:any;

    constructor() {
        this.targetedNetwork = Web3Service.Network;
    }
}
