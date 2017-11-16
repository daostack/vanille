// import { autoinject } from "aurelia-framework";
import  { 
      Organization
    , ArcDeployedContractKeys
    , ArcContractInfo
    , ArcDeployedContracts
    , getDefaultAccount
    , configure as configureArc
    , getDeployedContracts
    , getValueFromLogs
    , requireContract } from 'daostack-arc';
import { PLATFORM } from 'aurelia-framework';
import TruffleContract from 'truffle-contract';
import * as Web3 from "web3";
import { LogManager } from 'aurelia-framework';

// @autoinject()
export class ArcService {
   
  logger = LogManager.getLogger("Alchemy");

  constructor() {
    this.contractCache = new Map<string,TruffleContract>();
  }
  /**
   * The schemes managed by Arc
   */
  public arcContracts: ArcDeployedContractKeys;
  public arcSchemes: Array<ContractInfo>;
  public arcVotingMachines: Array<ContractInfo>;
  public arcGlobalConstraints: Array<ContractInfo>;
  /**
   * maps address to ContractInfo
   */
  public arcContractMap: Map<string,ContractInfo> = new Map<string,ContractInfo>();

  private contractCache: Map<string,TruffleContract>;
  
  public get defaultAccount(): string { return getDefaultAccount(); }

  public async initialize() {
    /**
     * Daostack-Arc's dependencies on contract json (artifact) files are manually defined
     * in webpack.config.vendor.js.  See ModuleDependenciesPlugin therein.
     */
    let arcSettings = await getDeployedContracts();
    let arcContracts = arcSettings.allContracts;

    for(let contractName in arcContracts) {
      arcContracts[contractName].name = this.convertKeyToFriendlyName(contractName);
      arcContracts[contractName].key = contractName;
    }

    this.arcContracts = arcContracts;
    this.arcSchemes = (<any>arcSettings.schemes) as Array<ContractInfo>;
    this.arcVotingMachines = (<any>arcSettings.votingMachines) as Array<ContractInfo>;
    this.arcGlobalConstraints = (<any>arcSettings.globalConstraints) as Array<ContractInfo>;

    for(var key in this.arcContracts) {
      var contract = this.arcContracts[key];
      this.arcContractMap.set(contract.address, contract);
    }

    // console.log(this.arcContracts);
    // each property is a contractInfo
  }
  
  public contractInfoFromKey(key:string): ContractInfo {
    return this.arcContracts[key] as ContractInfo;
  }

  public contractInfoFromAddress(address:string): ContractInfo {
    return this.arcContractMap.get(address) as ContractInfo;
  }


  public async getContract(key: string, at?: string): Promise<TruffleContract> {

    /**
     * The TruffleContract class actually represents multiple stages of the process:
     *  1) require("artifact.json");
     *  2) .deployed()
     *  3) .at()
     * 
     * The result of .at() is the only one that appears to be complete, with events and everything.
     * You can call .at() without having called .deployed() if you already have the address.
     * The contracts in arcContracts are all the result of require()
     */
    let contractInfo = this.contractInfoFromKey(key);
    let contract;
    if (contractInfo !== undefined) {
      if (!at) {
        at = contractInfo.address;
      }
      let cachedContract = this.contractCache.get(at);
      if (cachedContract) {
        return cachedContract;
      } else {
        contract = await contractInfo.contract.at(at);
      }
    } else {
      contract = requireContract(key);
      if (!at) {
          contract = await contract.deployed();
          at = contract.address;
      } else {
        let cachedContract = this.contractCache.get(at);
        if (cachedContract) {
          return cachedContract;
        } 
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
    try {
      return getValueFromLogs(tx, argName, eventName, index);
    } catch(ex) {
      let message = ex.message ? ex.message : ex;
      this.logger.error(`${message}${ex.stack ? `\n${ex.stack}` : ""}`);
      return "[not found]";
      // console.log(`${ex.message}\n{$ex.stack}`);
      // console.log(tx);
    }
  }

  public convertKeyToFriendlyName(key: string): string {
    if (!key) return null;

    // insert a space before all caps except at beginning.  Ignore consecutive caps alone (Like in TokenCapGC, ignore the 'C').
    key = key.replace(/(?!^)([a-z]|^)([A-Z])/g, '$1 $2');

    // uppercase the first character
    return key.replace(/^./, function(str){ return str.toUpperCase(); }) 
  }
}

/**
 * what we get from Arc, plus some
 */
export class ContractInfo implements ArcContractInfo {
    contract: any;
    address: string;
    /**
     * Pretty name
     */
    name: string;
    /**
     * short name (property name in ArcContracts).
     */
    key: string;
}

export { Organization } from 'daostack-arc'; 
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
