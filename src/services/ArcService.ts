import { autoinject } from "aurelia-framework";
import * as Arc from "@daostack/arc.js";

import TruffleContract from 'truffle-contract';
import { LogManager } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { EventConfigException, SnackLifetime } from '../entities/GeneralEvents';

@autoinject
export class ArcService {

  constructor(private eventAggregator: EventAggregator) {
    this.contractCache = new Map<string, Map<Arc.Address, TruffleContract>>();
  }

  public logger = LogManager.getLogger("Vanille");

  /**
   * The schemes managed by Arc
   */
  public arcContracts: Arc.ArcWrappers;
  public arcSchemes: Array<Arc.IContractWrapper>;
  public arcVotingMachines: Array<Arc.IContractWrapper>;
  public arcGlobalConstraints: Array<Arc.IContractWrapper>;
  /**
   * maps address to ContractInfo
   */
  private arcContractMap: Map<string, Arc.ContractWrapperBase | TruffleContract>;

  /**
   * cache by contract name, then by address.  Address == null for deployed.
   */
  private contractCache: Map<string, Map<Arc.Address, TruffleContract>>;

  public async initialize() {
    let wrappersByType = await Arc.WrapperService.wrappersByType;
    let wrappers = Arc.WrapperService.wrappers;

    this.arcContracts = wrappers;
    this.arcSchemes = wrappersByType.universalSchemes;
    this.arcVotingMachines = wrappersByType.votingMachines;
    this.arcGlobalConstraints = wrappersByType.globalConstraints;
    this.arcContractMap = Arc.WrapperService.wrappersByAddress;
  }
  /**
   * Returns the wrapper at the given address, undefined if not found.
   * @param address only returns wrappers for contracts deployed by the running version of Arc.js
   */
  public contractWrapperFromAddress(address: string): Arc.ContractWrapperBase {
    return this.arcContractMap.get(address) as Arc.ContractWrapperBase;
  }
  /**
   * 
   * @param name Returns a wrapper if possible (only for contracts migrated by the running version or Arc.js), else a TruffleContract
   * @param at Optional address
   * @returns undefined if not found
   */
  public async getContract(name: string, at: string = null): Promise<Arc.ContractWrapperBase | TruffleContract> {
    const wrapper = this.arcContracts[name];
    let contract;
    if (wrapper) {
      if (!at || (at === wrapper.address)) {
        return wrapper; // no need to cache, return deployed wrapper
      } else if (at) {
        contract = await wrapper
          .at(at)
          .catch((ex) => {
            return undefined;
          });
      }
    } else { // no wrapper we can use, so return TruffleContract
      let cachedContract = this.getCachedContract(name, at);
      if (cachedContract) {
        return cachedContract;
      } else {
        contract = await Arc.Utils.requireContract(name);
        if (!at) {
          contract = await contract.deployed()
            // `.then` gives us the true promise
            .then((c) => c)
            .catch((ex) => {
              return undefined;
            });
        } else { // no `at` so we want deployed
          contract = await contract.at(at)
            // `.then` gives us the true promise
            .then((c) => c)
            .catch((ex) => {
              return undefined;
            });
        }
      }
    }
    if (!contract) {
      throw new Error(`contract not found at: ${at}`);
    } else {
      this.setCachedContract(name, contract, at);
    }
    return contract;
  }

  /**
   * 
   * @param name TODO: use Arc.js's builtin caching
   * @param at 
   */
  private getCachedContract(name: string, at?: string): Arc.ContractWrapperBase | TruffleContract | undefined {
    const addressMap = this.contractCache.get(name);
    if (addressMap) {
      return addressMap.get(at ? at : `${name}_deployed`);
    }
    return undefined;
  }

  private setCachedContract(
    name: string,
    contract: Arc.ContractWrapperBase | TruffleContract,
    at?: string): void {

    let addressMap = this.contractCache.get(name);
    if (!addressMap) {
      addressMap = new Map<Arc.Address, Arc.ContractWrapperBase | TruffleContract>();
      this.contractCache.set(name, addressMap);
    }
    addressMap.set(contract.address, contract);
    if (!at) {
      // so we can also get the deployed version of this contract without the address
      addressMap.set(`${name}_deployed`, contract);
    }
  }

  /**
   * @param tx The transaction
   * @param argName The name of the property whose value we wish to return, from  the args object: tx.logs[index].args[argName]
   * @param eventName Overrides index, identifies which log, where tx.logs[n].event  === eventName
   * @param index Identifies which log, when eventName is not given
   */
  public getValueFromTransactionLog(tx, argName, eventName?, index = 0) {
    try {
      return Arc.TransactionService.getValueFromLogs(tx, argName, eventName, index);
    } catch (ex) {
      let message = ex.message ? ex.message : ex;
      this.logger.error(`${message}${ex.stack ? `\n${ex.stack}` : ""}`);
      return "[not found]";
    }
  }

  /**
   * Set the parameters on the contract.  Returns hash.
   * IMPORTANT:  Ignores contractAddress.  Only works against wrappers of contracts
   * migrated by the currently-running version of Arc.js.
   * Otherwise there would be the potential for corrupting incompatible contracts.
   * TODO: Make dashboards aware of the above!
   * @param params 
   */
  public async setContractParameters(
    params: any,
    name: string,
    contractAddress?: string): Promise<string> {
    try {
      const wrapper = this.arcContracts[name];

      if (!wrapper || (wrapper.address !== contractAddress)) {
        throw new Error("wrapper does not exist with the given name or address");
      }
      return (await wrapper.setParameters(params)).result;
    }
    catch (ex) {
      this.eventAggregator.publish("handleException", new EventConfigException(`Error setting contract parameters`, ex, undefined, SnackLifetime.none));
      throw ex;
    }
  }
}

export class ContractWrapperInfo {
  public address: string;
  public friendlyName: string;
  public name: string;
}

export * from '@daostack/arc.js';
export { TruffleContract } from 'truffle-contract';
