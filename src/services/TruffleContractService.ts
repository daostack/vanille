import { autoinject } from "aurelia-framework";
import TruffleContract from 'truffle-contract';

@autoinject
export class TruffleContractService {

    constructor() {}
    /**
     * Given JSON, returns object implementing the contract interface.
     * @param jsonContract 
     */
    public contract(jsonContract: object): TruffleContract {
        return new TruffleContract(jsonContract);
    }
}
