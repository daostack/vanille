// import { autoinject } from "aurelia-framework";
import  { Organization
    , getDefaultAccount
    , configure as configureArc
    , getUniversalSchemes
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
  public arcSchemes: ArcSchemes;
  private contractCache: Map<string,TruffleContract>;
  
  public get defaultAccount(): string { return getDefaultAccount(); }

  public async initialize() {
      /**
       * Emergent-Arc's dependencies on contract json (artifact) files are manually defined
       * in webpack.config.vendor.js.  See ModuleDependenciesPlugin therein.
       */
      this.arcSchemes = await getUniversalSchemes() as ArcSchemes;
      // console.log(this.arcSchemes);
      // each property is a contractInfo
      for(let contractName in this.arcSchemes) {
        // let actualContract = await this.getContract(contractName);
        // contractInfos[contractName].name = this.convertCamelCaseToText(actualContract.contractName)
        this.arcSchemes[contractName].name = this.convertKeyToFriendlyName(contractName);
        this.arcSchemes[contractName].key = contractName;
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
     * The contracts in arcSchemes are all the result of .deployed()
     */
    let contract = this.contractCache.get(at);
    if (contract) {
      return contract;
    }
    
    let contractInfo = this.arcSchemes[name];
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
   * @param tx The transaction
   * @param argName The name of the property whose value we wish to return, from  the args object: tx.logs[index].args[argName]
   * @param eventName Overrides index, identifies which log, where tx.logs[n].event  === eventName
   * @param index Identifies which log, when eventName is not given
   */
  public getValueFromTransactionLog(tx, argName, eventName?, index=0) {
      return getValueFromLogs(tx, argName, eventName, index);
  }

  public convertKeyToFriendlyName(key: string): string {
    if (!key) return null;

    // insert a space before all caps except at beginning
    key = key.replace(/(?!^)([A-Z])/g, ' $1');

    // uppercase the first character
    return key.replace(/^./, function(str){ return str.toUpperCase(); }) 
  }

  /**
   * If the contract belows to Arc and was given to use in the ArcSettings,
   * then we'll return the name of it here.
   * @param address 
   */
  public contractKeyFromAddress(address) {
    for(var contractKey in this.arcSchemes) {
      var contract = this.arcSchemes[contractKey];
      if (contract.address === address) {
        return contractKey;
      }
    }
    return null;
  }
}

interface ArcSchemes {
    SimpleContributionScheme: ContractInfo;
    GenesisScheme: ContractInfo;
    GlobalConstraintRegistrar: ContractInfo;
    SchemeRegistrar: ContractInfo;
    SimpleICO: ContractInfo;
    TokenCapGC: ContractInfo;
    UpgradeScheme: ContractInfo;
    SimpleVote: ContractInfo;
    AbsoluteVote: ContractInfo;
    // DAOToken: ContractInfo;
    // MintableToken: ContractInfo;
}

/**
 * this is what we get from Arc
 */
export class ArcContractInfo {
  /**
   * deployed-only TruffleContract
   */
  contract: TruffleContract;
  address: string;
}

/**
 * what we get from Arc, plus some
 */
export class ContractInfo extends ArcContractInfo {
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
