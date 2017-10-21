// import { autoinject } from "aurelia-framework";
import  { Organization
    , getDefaultAccount
    , configure as configureArc
    , getUniversalContracts
    , getValueFromLogs
    , requireContract } from 'emergent-arc';
import { PLATFORM } from 'aurelia-framework';
import TruffleContract from 'truffle-contract';
import * as Web3 from "web3";

// @autoinject()
export class ArcService {
    
    private static universalContracts: ArcSettings;

    public get defaultAccount(): string { return getDefaultAccount(); }
    public get contracts(): ArcDeployedContracts { return ArcService.universalContracts ? ArcService.universalContracts.daostackContracts : null; }
    
    public static async initialize() {
        /**
         * Emergent-Arc's dependencies on contract json (artifact) files are manually defined
         * in webpack.config.vendor.js.  See ModuleDependenciesPlugin therein.
         */
        ArcService.universalContracts = await getUniversalContracts();
   }
    
    public async getContract(name: string, at?: string) {
        let contract: TruffleContract;
        let arcContractSpec:ArcContractInfo = ArcService.universalContracts.daostackContracts[name];
        if (arcContractSpec !== undefined) {
            contract = arcContractSpec.contract;
            if (!at) {
                at = arcContractSpec.address;
            }
        } else {
            contract = requireContract(name);
            if (!at) {
                const deployed = await contract.deployed();
                at = deployed.address;
            }
        }
        return await contract.at(at);
    }

    // TODO: Probably should move this into a separate service
    public async getDAOStackMintableToken() {
        const schemeRegistrar = await this.getContract("SchemeRegistrar");
        const mintableTokenAddress = await schemeRegistrar.nativeToken();
        const mintableTokenContract = await this.getContract("MintableToken", mintableTokenAddress);
        return mintableTokenContract;
    }

    // private getArcContractInfo(name: string): ArcContractInfo {
    //     return ArcService.settings.daostackContracts[name];
    // }

    // private getTruffleContract(name: string): TruffleContract {
    //     return this.getArcContractInfo(name).contract;
    // }

    /**
     * @param tx The transaction
     * @param argName The name of the property whose value we wish to return, from  the args object: tx.logs[index].args[argName]
     * @param eventName Overrides index, identifies which log, where tx.logs[n].event  === eventName
     * @param index Identifies which log, when eventName is not given
     */
    public getValueFromTransactionLog(tx, argName, eventName?, index=0) {
        return getValueFromLogs(tx, argName, eventName, index);
    }
}

interface ArcSettings {
    votingMachine: string;
    daostackContracts: ArcDeployedContracts;
}

interface ArcDeployedContracts {
    SimpleContributionScheme: ArcContractInfo;
    GenesisScheme: ArcContractInfo;
    GlobalConstraintRegistrar: ArcContractInfo;
    SchemeRegistrar: ArcContractInfo;
    SimpleICO: ArcContractInfo;
    TokenCapGC: ArcContractInfo;
    UpgradeScheme: ArcContractInfo;
    SimpleVote: ArcContractInfo;
    OrganizationRegister: ArcContractInfo;
    // DAOToken: ArcContractInfo;
    // MintableToken: ArcContractInfo;
}

export interface ArcContractInfo {
    contract: TruffleContract;
    address: string;
}

export { Organization } from 'emergent-arc'; 

// export {GenesisScheme};
// export {GlobalConstraintRegistrar};
// export {SchemeRegistrar};
// export {SimpleContributionScheme};
// export {SimpleICO};
// export {SimpleVote};
// export {TokenCapGC};
// export {UpgradeScheme};
// export {OrganizationRegister};
