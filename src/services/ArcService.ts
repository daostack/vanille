import { autoinject } from "aurelia-framework";
import * as Arc from "@daostack/arc.js";

import { PLATFORM } from 'aurelia-framework';
import TruffleContract from 'truffle-contract';
import { LogManager } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { EventConfigException, SnackLifetime } from '../entities/GeneralEvents';
import { ArcSchemesDropdown } from "resources/customElements/arcSchemesDropdown/arcSchemesDropdown";

@autoinject
export class ArcService {

  constructor(private eventAggregator: EventAggregator) {
    this.contractCache = new Map<string, TruffleContract>();
  }

  public logger = LogManager.getLogger("Vanille");

  /**
   * The schemes managed by Arc
   */
  public arcContracts: Arc.ArcWrappers;
  public arcSchemes: Array<Arc.ContractWrapperBase>;
  public arcVotingMachines: Array<Arc.ContractWrapperBase>;
  public arcGlobalConstraints: Array<Arc.ContractWrapperBase>;
  /**
   * maps address to ContractInfo
   */
  private arcContractMap: Map<string, Arc.ContractWrapperBase>;

  private contractCache: Map<string, TruffleContract>;

  public async initialize() {
    let wrappersByType = await Arc.WrapperService.wrappersByType;
    let wrappers = Arc.WrapperService.wrappers;

    this.arcContracts = wrappers;
    this.arcSchemes = wrappersByType.schemes;
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
   */
  public async getContract(name: string, at?: string): Promise<Arc.ContractWrapperBase | TruffleContract> {
    const wrapper = this.arcContracts[name];
    let contract;
    if (wrapper && (!at || (at === wrapper.address))) {
      return wrapper;
    } else { // no wrapper we can use, so return TruffleContract
      contract = await Arc.Utils.requireContract(name);
      if (at) {
        let cachedContract = this.contractCache.get(at);
        if (cachedContract) {
          return cachedContract;
        } else {
          // the only way to catch errors is with .then
          await contract.at(at).then((result) => {
            contract = result;
          });
        }
      } else { // no `at` so we want deployed
        contract = await contract.deployed();
      }
      if (!contract) {
        throw new Error(`contract not found at: ${at}`);
      }
      this.contractCache.set(at, contract);
      return contract;
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
      return Arc.Utils.getValueFromLogs(tx, argName, eventName, index);
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
