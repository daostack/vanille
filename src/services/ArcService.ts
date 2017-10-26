import { ContractInfo } from './ArcService';
// import { autoinject } from "aurelia-framework";
import  { Organization
    , getDefaultAccount
    , configure as configureArc
    , getUniversalContracts as getArcSettings
    , getValueFromLogs
    , requireContract } from 'emergent-arc';
import { PLATFORM } from 'aurelia-framework';
import TruffleContract from 'truffle-contract';
import * as Web3 from "web3";

// @autoinject()
export class ArcService {
    
  constructor() {
    this.contractCache = new Map<string,TruffleContract>();
  }
  /**
   * The schemes managed by Arc
   */
  private _arcSettings: ArcSettings;
  // private daoSchemes: Map<string,ContractInfo>;
  private contractCache: Map<string,TruffleContract>;
  /**
   * The scheme contracts that we know about, that we present to the user
   */
  public knownSchemes: Array<ContractInfo>;
  
  public get defaultAccount(): string { return getDefaultAccount(); }
  public get deployedArcContracts(): ArcDeployedContracts { return this._arcSettings ? this._arcSettings.daostackContracts : null; }
  
  public async initialize() {
      /**
       * Emergent-Arc's dependencies on contract json (artifact) files are manually defined
       * in webpack.config.vendor.js.  See ModuleDependenciesPlugin therein.
       */
      this._arcSettings = await getArcSettings();

      this.knownSchemes = [
        this._arcSettings.daostackContracts.SchemeRegistrar
        , this._arcSettings.daostackContracts.UpgradeScheme
        , this._arcSettings.daostackContracts.GlobalConstraintRegistrar
        , this._arcSettings.daostackContracts.SimpleContributionScheme
      ];
  
      /**
       * get names of contracts by converting camel case property name to first-capitalized text
       */
      let contractInfos = this.deployedArcContracts;
      // each property is a contractInfo
      for(let contractName in this.deployedArcContracts) {
        // let actualContract = await this.getContract(contractName);
        // contractInfos[contractName].name = this.convertCamelCaseToText(actualContract.contractName)
        contractInfos[contractName].name = this.convertCamelCaseToText(contractName);
        contractInfos[contractName].key = contractName;
      }
    }
  
  public async getContract(name: string, at?: string): Promise<TruffleContract> {

    /**
     * The TruffleContract class actually represents multiple stages of the process:
     *  1) require("artifact.json");
     *  2) .deployed()
     *  3) .at()
     * 
     * The result of .at() is the only one that appears to be complete, with events and everything.
     * You can call .at() without having called .deployed().
     * The contracts in _arcSettings.daostackContracts are all the result of .deployed()
     */
    let contract = this.contractCache.get(at);
    if (contract) {
      return contract;
    }
    
    let contractInfo = this._arcSettings.daostackContracts[name];
    if (contractInfo !== undefined) {
      if (!at) {
        at = contractInfo.address;
      }
      contract = await contractInfo.contract.at(at);
    } else {
      contract = requireContract(name);
      if (!at) {
          contract = await contract.deployed();
          at = contract.address;
      }
      contract = await contract.at(at);
    }
    this.contractCache.set(at, contract);
    return contract;
  }

  /**
   *  Enumerate all known schemes and determine whether the given DAO is registered to them.
   * Return the TruffleContracts for each one in which the DAO is registered.
   * @param daoAddress
   */
  public async getSchemesForDao(daoAddress: string): Promise<Array<ContractInfo>> {

    // TODO: cache these
    let schemes = new Array<ContractInfo>();
    for (let schemeInfo of this.knownSchemes) {
      let truffleContract = await this.getContract(schemeInfo.key);
      let isRegistered = await truffleContract.isRegistered(daoAddress);
      if (isRegistered) {
        schemes.push(schemeInfo);
      }
    }
    return schemes;
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

  private convertCamelCaseToText(cc: string): string {
    return cc
      // insert a space before all caps
      .replace(/([A-Z])/g, ' $1')
      // uppercase the first character
      .replace(/^./, function(str){ return str.toUpperCase(); }) 
  }
}

interface ArcSettings {
    votingMachine: string;
    daostackContracts: ArcDeployedContracts;
}

interface ArcDeployedContracts {
    SimpleContributionScheme: ContractInfo;
    GenesisScheme: ContractInfo;
    GlobalConstraintRegistrar: ContractInfo;
    SchemeRegistrar: ContractInfo;
    SimpleICO: ContractInfo;
    TokenCapGC: ContractInfo;
    UpgradeScheme: ContractInfo;
    SimpleVote: ContractInfo;
    OrganizationRegister: ContractInfo;
    // DAOToken: ArcContractInfo;
    // MintableToken: ArcContractInfo;
}

export interface ContractInfo {
    /**
     * deployed TruffleContract
     */
    contract: TruffleContract;
    address: string;
    /**
     * Pretty name
     */
    name: string;
    /**
     * short name (property name in ArcDeployedContracts).
     */
    key: string;
}

export { Organization } from 'emergent-arc'; 
export { TruffleContract } from 'truffle-contract';

// export {GenesisScheme};
// export {GlobalConstraintRegistrar};
// export {SchemeRegistrar};
// export {SimpleContributionScheme};
// export {SimpleICO};
// export {SimpleVote};
// export {TokenCapGC};
// export {UpgradeScheme};
// export {OrganizationRegister};
