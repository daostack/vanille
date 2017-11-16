import { autoinject } from "aurelia-framework";
import { ArcService, TruffleContract, Organization, ContractInfo } from './ArcService';
import { Web3Service } from "../services/Web3Service";
import { EventAggregator, includeEventsIn, Subscription  } from 'aurelia-event-aggregator';
import { LogManager } from 'aurelia-framework';

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
  logger = LogManager.getLogger("Alchemy");

  /**
   * a DAO has been added or removed
   */
  public static daoSetChangedEvent:string = "daoSetChanged";
  /**
   * a Scheme has been added or removed from a DAO.
   */
  public static daoSchemeSetChangedEvent:string = "daoSchemeSetChanged";

  public async initialize()
    {
      let genesisScheme = await this.arcService.getContract("GenesisScheme");
      let myEvent = genesisScheme.NewOrg({}, { fromBlock: 0 });
      /**
       * handleNewOrg will be called right away for all the DAOs in the system, and thereafter
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

  public async organizationAt(avatarAddress: string, takeFromCache: boolean = true): Promise<DAO> {

    let dao: DAO;
    let cachedDao = this.daoCache.get(avatarAddress);

    if (!takeFromCache || !cachedDao) {
        let org = <DAO>(await Organization.at(avatarAddress) as any);
        org.name = await this.organizationName(org);
        org.address = avatarAddress;
        dao = await DAO.fromOrganization(org, this.arcService, this);
    } else {
      dao = cachedDao;
    }

    if (!cachedDao) {
      this.logger.debug(`caching dao: ${dao.name ? `${dao.name}: ` : ""}${dao.address}`);
      this.daoCache.set(dao.address,dao);
    }

    return dao;
  }

  public async organizationName(org: DAO) {
    return this.web3.bytes32ToUtf8(await org.avatar.orgName());     
  }

  public get allOrganizations(): Array<DAO> {
    return Array.from(this.daoCache.values());
  }

  private async handleNewOrg(err, eventsArray) : Promise<void>
  {
    let newOrganizationArray = [];
    if (!(eventsArray instanceof Array)) {
      eventsArray = [eventsArray];
    }
    let counter = 0;
    let count = eventsArray.length;
    for (let i = 0; i < count; i++) {
        let promotedAmount = 0;
        let avatarAddress =  eventsArray[i].args._avatar;
        // this has side-effect of initializing and caching the dao
        let dao = await this.organizationAt(avatarAddress);
        ++counter;

        if (counter == count) { // then we're done
            this.publish(OrganizationService.daoSetChangedEvent, this.allOrganizations);
        }
      }
  }

  public async getSchemesInOrganization(daoAddress: string): Promise<Array<DaoSchemeInfo>> {
      let org = await this.organizationAt(daoAddress);
      return org.allSchemes;
  }

  /*****
   * The following three event methods will be replaced by the event aggregator.
   * See OrganizationService.daoSetChangedEvent
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
export class DaoSchemeInfo extends ContractInfo {
  //public permissions: Permissions;
}

export class DAO extends Organization {

  private schemesCache = new Map<string,DaoSchemeInfo>();
  private registerSchemeEvent;
  private unRegisterSchemeEvent;
  public arcService: ArcService;
  public organizationService: OrganizationService;
  logger = LogManager.getLogger("Alchemy");

  /* this is not meant to be instantiated here, only in Arc */
  private constructor() {
    super();
  }

  public static async fromOrganization(
      org: Organization
      , arcService: ArcService
      , organizationService: OrganizationService): Promise<DAO> {

    let newDAO = Object.assign(new DAO(), org);
    newDAO.arcService = arcService;
    newDAO.organizationService = organizationService;
    await newDAO.initialize();
    return newDAO;
  }

  public async initialize()
  {
    /**
     * this is triggered right away for every scheme in the DAO, and thereafter
     * whenever a new scheme is registered
     */
    this.registerSchemeEvent = this.controller.RegisterScheme({}, {fromBlock: 0, toBlock: 'latest'});

    await new Promise((resolve,reject) => {
      this.registerSchemeEvent.watch((err, eventsArray) => this.handleSchemeEvent(err, eventsArray, true).then(() => { resolve(); }));
    });

    this.registerSchemeEvent = this.controller.UnregisterScheme({}, {fromBlock: 0, toBlock: 'latest'});

    return new Promise((resolve,reject) => {
      this.registerSchemeEvent.watch((err, eventsArray) => this.handleSchemeEvent(err, eventsArray, false).then(() => { resolve(); }));
    });
  }
  
  public get allSchemes(): Array<DaoSchemeInfo> {
    return Array.from(this.schemesCache.values());
  }

  private async handleSchemeEvent(err, eventsArray, adding:boolean) : Promise<void>
  {
    let newSchemesArray = [];
    if (!(eventsArray instanceof Array)) {
      eventsArray = [eventsArray];
    }
    let counter = 0;
    let count = eventsArray.length;
    for (let i = 0; i < count; i++) {
      let schemeAddress =  eventsArray[i].args._scheme;
      let contractInfo = this.arcService.contractInfoFromAddress(schemeAddress);
      //let permissions = await this.controller.getSchemePermissions(schemeAddress);

      if (adding) {
        this.logger.debug(`caching scheme: ${contractInfo.name}: ${contractInfo.address}`);
        this.schemesCache.set(schemeAddress,contractInfo);
      } else if (this.schemesCache.has(schemeAddress)) {
          this.logger.debug(`uncaching scheme: ${contractInfo.name}: ${contractInfo.address}`);
          this.schemesCache.delete(schemeAddress);
      }

      ++counter;

      if (counter == count) { // then we're done
          this.organizationService.publish(OrganizationService.daoSchemeSetChangedEvent, 
          {
            dao: this,
            schemes:  Array.from(this.allSchemes)
          });
      }
    }
  }
}

// export {Organization} from './ArcService';
