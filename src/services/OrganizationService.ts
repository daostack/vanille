import { autoinject } from "aurelia-framework";
import { ArcService, TruffleContract, Organization, ContractInfo } from './ArcService';
import { Web3Service } from "../services/Web3Service";
import { EventAggregator, includeEventsIn, Subscription  } from 'aurelia-event-aggregator';
// import { VotingMachineService, VotingMachineInfo } from  "../services/VotingMachineService";

@autoinject
export class OrganizationService {

  constructor(
    private arcService: ArcService
    , private web3: Web3Service
    //, private votingMachineService: VotingMachineService
  ) {
    includeEventsIn(this);
  }

  private daoCache = new Map<string,DAO>();
  private schemeCache = new Map<string,Array<DaoSchemeInfo>>();

  public static daoSetChangedEvent:string = "daoSetChanged";

  public async initialize()
    {
      let genesisScheme = await this.arcService.getContract("GenesisScheme");
      /**
       * TODO:  To sync cache on organization schemes, must subscribe to this event on every organization.
       */
      let myEvent = genesisScheme.NewOrg({}, { fromBlock: 0 });
      /**
       * handleNewOrg will be called right away for every DAO in the system, and thereafter
       * whenever a new DAO is created
       */
      return new Promise((resolve,reject) => {
        myEvent.watch((err, eventsArray) => this.handleNewOrg(err, eventsArray).then(() => { resolve(); }));
      });
    }

  public async getDAOStackAddress() {
    const schemeRegistrar = await this.arcService.getContract("SchemeRegistrar");
    return await schemeRegistrar.beneficiary();
  }

  public async getDAOStackOrganization() {
      const avatarAddress = await this.getDAOStackAddress();
      return await this.organizationAt(avatarAddress);
  }


  public async createOrganization(config: OrganizationCreateConfig): Promise<DAO> {
    return <DAO>(await Organization.new(config) as any);
  }

  public async organizationAt(avatarAddress: string, fromCache: boolean = true): Promise<DAO> {
    let org: DAO = fromCache ? this.daoCache.get(avatarAddress) : null;
    if (!fromCache || !org) {
        org = <DAO>(await Organization.at(avatarAddress) as any);
    }
    return org;
  }

  public async organizationName(org: DAO) {
    return this.web3.bytes32ToUtf8(await org.avatar.orgName());     
  }

  public get allOrganizations(): Array<DAO> {
    return Array.from(this.daoCache.values());
  }

  private handleNewOrg(err, eventsArray) : Promise<void>
  {
    return new Promise(async (resolve,reject) => {
      let newOrganizationArray = [];
      if (!(eventsArray instanceof Array)) {
        eventsArray = [eventsArray];
      }
      let counter = 0;
      let count = eventsArray.length;
      for (let i = 0; i < eventsArray.length; i++) {
          let promotedAmount = 0;
          let avatarAddress =  eventsArray[i].args._avatar;
          let organization = await this.organizationAt(avatarAddress);
          organization.name = await this.organizationName(organization);
          organization.address = avatarAddress;

          this.daoCache.set(organization.address,organization);
          ++counter;

          if (counter == count) { // then we're done
              this.publish(OrganizationService.daoSetChangedEvent, this.allOrganizations);
              resolve();
          }
        }
      });
  }

  public async getSchemesInOrganization(daoAddress: string): Promise<Array<DaoSchemeInfo>> {
    let schemes = this.schemeCache.get(daoAddress);
    if (!schemes) {
      let org = await this.organizationAt(daoAddress);
      schemes = (await org.schemes()).map((orgSchemeInfo: OrganizationSchemeInfo) => {
        return {
          address: orgSchemeInfo.address,
          // permissions: ToPermissionsEnum(orgSchemeInfo.permissions),
          name: this.arcService.convertKeyToFriendlyName(orgSchemeInfo.contract),
          key: orgSchemeInfo.contract
          // , contract: this.arcService.arcContractMap.get(orgSchemeInfo.contract)
        }
      });
      this.schemeCache.set(daoAddress, schemes);
    }
    return schemes;
  }

  /*****
   * The following three event methods will be replaced by the event aggregator
   */

  /**
    * Publishes a message.
    * @param event The event or channel to publish to.
    * @param data The data to publish on the channel.
    */
    public publish(event: string | any, data?: any): void {}
    
    /**
      * Subscribes to a message channel or message type.
      * @param event The event channel or event data type.
      * @param callback The callback to be invoked when when the specified message is published.
      */
      public subscribe(event: string | Function, callback: Function): Subscription  { return null; }
    
    /**
      * Subscribes to a message channel or message type, then disposes the subscription automatically after the first message is received.
      * @param event The event channel or event data type.
      * @param callback The callback to be invoked when when the specified message is published.
      */
      public subscribeOnce(event: string | Function, callback: Function): Subscription  { return null; }
}

export interface Founder {
  address: string;
  tokens: number;
  reputation: number;
}

export interface OrganizationCreateConfig {
  orgName: string;
  tokenName: string;
  tokenSymbol: string;
  founders: Array<Founder>;
  votingMachine: string, // address
  votePrec: Number,
  ownerVote: boolean,
  schemes: Array<{ contract: string, address: string }>
}


/**
 * returned by Organization.schemes()
 */
interface OrganizationSchemeInfo {
  contract: string; // is the contract key!!!
  address: string;
  permissions: string;
}

/**
 * scheme that is in a DAO
 */
export class DaoSchemeInfo {

  public address: string;
  /**
   * Pretty name
   */
  public name: string;
  /**
   * short name (property name in ArcDeployedContracts).
   */
  public key: string;
  /**
   * contract prior to .at().  Undefined if not an Arc contract.
   */
  // public contract: TruffleContract;
  //public permissions: Permissions;
}

// export { Organization } from './ArcService';

/**
 * The way the code is structured, the compiler doesn't know about the Organization interface.
 * TODO: Create a d.ts.
 */
export interface DAO {
  address: string;
  name: string;
  /**
   * includes static `new` and `at`
   */
  // Avatar truffle contract
  avatar: TruffleContract; 
  /**
   * Controller truffle contract
   */ 
  controller: TruffleContract; 
  /**
   * DAOToken truffle contract
   */ 
  token: TruffleContract; 
  /**
   * Reputation truffle contract
   */ 
  reputation: TruffleContract; 
  /**
   * AbsoluteVote truffle contract
   */ 
  votingMachine: TruffleContract; 

  schemes(contractName?:string);
  scheme(contractName:string);
  checkSchemeConditions(contractName:string);
  proposeScheme(options?);
  proposeGlobalConstraint(options?);
  vote(proposalId, choice, params);
}

export {Organization} from './ArcService';
