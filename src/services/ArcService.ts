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
    
    private cache = new Map<string,Organization>();
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

    public async getDAOStackMintableToken() {
        const schemeRegistrar = await this.getContract("SchemeRegistrar");
        const mintableTokenAddress = await schemeRegistrar.nativeToken();
        const mintableTokenContract = await this.getContract("MintableToken", mintableTokenAddress);
        return mintableTokenContract;
    }

    public async getDAOStackAddress() {
        const schemeRegistrar = await this.getContract("SchemeRegistrar");
        return await schemeRegistrar.beneficiary();
    }

    public async getDAOStackOrganization() {
        const avatarAddress = await this.getDAOStackAddress();
        const org = await this.organizationAt(avatarAddress);
        return org;
    }

    // private getArcContractInfo(name: string): ArcContractInfo {
    //     return ArcService.settings.daostackContracts[name];
    // }

    // private getTruffleContract(name: string): TruffleContract {
    //     return this.getArcContractInfo(name).contract;
    // }

    public async createOrganization(config: OrganizationCreateConfig): Promise<Organization> {
        const org = await Organization.new(config);
        this.cache.set(org.avatar.address,org);
        return org;
    }

    public async organizationAt(avatarAddress: string, fromCache: boolean = true): Promise<Organization> {
        let org: Organization;
        if (!fromCache || !(org = this.cache.get(avatarAddress)) ) {
            org = await Organization.at(avatarAddress);
            this.cache.set(avatarAddress,org);
        }
        return org;
    }

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

export interface OrganizationCreateConfig {
    orgName: string;
    tokenName: string;
    tokenSymbol: string;
    founders: Array<Founder>;
}

export { Organization } from 'emergent-arc'; 

export interface Founder {
    address: string;
    tokens: number;
    reputation: number;
}
  
// export {GenesisScheme};
// export {GlobalConstraintRegistrar};
// export {SchemeRegistrar};
// export {SimpleContributionScheme};
// export {SimpleICO};
// export {SimpleVote};
// export {TokenCapGC};
// export {UpgradeScheme};
// export {OrganizationRegister};
