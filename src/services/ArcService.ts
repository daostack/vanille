import { autoinject } from "aurelia-framework";
import * as Arc from 'daostack-arc';
import { configure as configureArc } from 'daostack-arc';

import { PLATFORM } from 'aurelia-framework';
import TruffleContract from 'truffle-contract';
import * as Web3 from "web3";
import { LogManager } from 'aurelia-framework';
import { EventAggregator  } from 'aurelia-event-aggregator';
import  { EventConfigException, SnackLifetime } from '../entities/GeneralEvents';
import { ArcSchemesDropdown } from "resources/customElements/arcSchemesDropdown/arcSchemesDropdown";

@autoinject
export class ArcService {
   
  logger = LogManager.getLogger("Alchemy");

  constructor(private eventAggregator: EventAggregator) {
    this.contractCache = new Map<string,TruffleContract>();
  }
  /**
   * The schemes managed by Arc
   */
  public arcContracts: Arc.ArcDeployedContractNames;
  public arcSchemes: Array<ContractInfo>;
  public arcVotingMachines: Array<ContractInfo>;
  public arcGlobalConstraints: Array<ContractInfo>;
  /**
   * maps address to ContractInfo
   */
  private arcContractMap: Map<string,ContractInfo> = new Map<string,ContractInfo>();

  private contractCache: Map<string,TruffleContract>;
  
  public get defaultAccount(): string { return Arc.getDefaultAccount(); }

  public async initialize() {
    let arcSettings = await Arc.getDeployedContracts();
    let arcContracts = arcSettings.allContracts;

    for(let contractName in arcContracts) {
      arcContracts[contractName].friendlyName = ArcService.convertKeyToFriendlyName(contractName);
      arcContracts[contractName].name = contractName;
    }

    this.arcContracts = arcContracts;
    this.arcSchemes = (<any>arcSettings.schemes) as Array<ContractInfo>;
    this.arcVotingMachines = (<any>arcSettings.votingMachines) as Array<ContractInfo>;
    this.arcGlobalConstraints = (<any>arcSettings.globalConstraints) as Array<ContractInfo>;

    for(var name in this.arcContracts) {
      var contract = this.arcContracts[name];
      this.arcContractMap.set(contract.address, contract);
    }

    // console.log(this.arcContracts);
    // each property is a contractInfo
  }
  
  private contractInfoFromName(name:string): ContractInfo {
    return this.arcContracts[name] as ContractInfo;
  }

  public contractInfoFromAddress(address:string): ContractInfo {
    return this.arcContractMap.get(address) as ContractInfo;
  }


  public async getContract(name: string, at?: string): Promise<TruffleContract> {

    /**
     * The TruffleContract class actually represents multiple stages of the process:
     *  1) require("artifact.json");
     *  2) .deployed()
     *  3) .at()
     * 
     * The result of .at() is the only one that appears to be complete, with events and everything.
     * It will be the Arc javascript wrapper when is an Arc contract.
     * You can call .at() without having called .deployed() if you already have the address.
     * The contracts in arcContracts are all the result of require()
     */
    let contractInfo = this.contractInfoFromName(name);
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
      contract = Arc.requireContract(name);
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
      return Arc.getValueFromLogs(tx, argName, eventName, index);
    } catch(ex) {
      let message = ex.message ? ex.message : ex;
      this.logger.error(`${message}${ex.stack ? `\n${ex.stack}` : ""}`);
      return "[not found]";
      // console.log(`${ex.message}\n{$ex.stack}`);
      // console.log(tx);
    }
  }

  public static convertKeyToFriendlyName(name: string): string {
    if (!name) return null;

    // insert a space before all caps except at beginning.  Ignore consecutive caps alone (Like in TokenCapGC, ignore the 'C').
    name = name.replace(/(?!^)([a-z]|^)([A-Z])/g, '$1 $2');

    // uppercase the first character
    return name.replace(/^./, function(str){ return str.toUpperCase(); }) 
  }

    /**
     * Set the parameters on the contract.  Returns hash.
     * @param params 
     */
    public async setContractParameters(
      params: any,
      name: string,
      contractAddress?: string): Promise<string> {
      try {
        const contract = await this.getContract(name, contractAddress);
        return await contract.setParams(params);
      }
      catch(ex) {
        this.eventAggregator.publish("handleException", new EventConfigException(`Error setting contract parameters`, ex, undefined, SnackLifetime.none));
        throw ex;
      }
    }
}

/**
 * what we get from Arc, plus some
 */
export class ContractInfo implements Arc.ArcContractInfo {
    /**
     * An uninitialized instance of ExtendTruffleContract,
     * basically the class factory with static methods.
     */
    contract: any;
    /**
     * address of the instance deployed by Arc.
     * Calling contract.at() (a static method on ExtendTruffleContract) will return a 
     * the properly initialized instance of ExtendTruffleContract.
     */
    address: string;
    /**
     * Pretty name
     */
    friendlyName: string;
    /**
     * short name (property name in ArcContracts, like "SchemeRegistrar").
     */
    name: string;
}

export * from 'daostack-arc'; 
export { TruffleContract } from 'truffle-contract';

// export {GenesisScheme};
// export {GlobalConstraintRegistrar, GlobalConstraintRegistrarParams};
// export {SchemeRegistrar, ProposeToAddModifySchemeParams, ProposeToRemoveSchemeParams};
// export {SimpleContributionScheme};
// export {SimpleICO};
// export {SimpleVote};
// export {TokenCapGC};
// export {UpgradeScheme};
// export {OrganizationRegister};
