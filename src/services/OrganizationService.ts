import { autoinject } from "aurelia-framework";
import { ArcService, TruffleContract, Organization, ContractInfo } from './ArcService';
import { Web3Service } from "../services/Web3Service";
import { includeEventsIn, Subscription  } from 'aurelia-event-aggregator';
import { LogManager } from 'aurelia-framework';
import { DAO } from '../entities/DAO';
import { DaoSchemeInfo } from '../entities/DaoSchemeInfo';
import { DaoSchemeDashboard } from "schemeDashboards/schemeDashboard";
import { EventAggregator  } from 'aurelia-event-aggregator';
import  { EventConfigException, SnackLifetime } from '../entities/GeneralEvents';

@autoinject
export class OrganizationService {

  constructor(
    private arcService: ArcService
    , private web3: Web3Service
    , private eventAggregator: EventAggregator
  ) {
    includeEventsIn(this);
  }

  private daoCache = new Map<string,DAO>();
  logger = LogManager.getLogger("Alchemy");

  /**
   * a DAO has been added or removed
   */
  public static daoAddedEvent:string = "daoSetChanged";

  public async initialize()
  {
    return new Promise(async (resolve,reject) => {

      let genesisScheme = await this.arcService.getContract("GenesisScheme");
      let myEvent = genesisScheme.NewOrg({}, { fromBlock: 0 });
      /**
       * get():  fires once for all the DAOs in the system; resolve() will be called properly.
       * watch(): fires whenever a new DAO is created thereafter
       */
      myEvent.get((err, eventsArray) => this.handleNewOrg(err, eventsArray).then(() => { this.logger.debug("Finished loading daos"); resolve(); }));
      myEvent = genesisScheme.NewOrg({});
      myEvent.watch((err, eventsArray) => this.handleNewOrg(err, eventsArray));
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
    try {
      let org = await Organization.new(config);
      let dao = await DAO.fromOrganization(org, this.arcService, this.web3);
      this.daoCache.set(dao.address,dao);
      return dao;
    } catch(ex) {
        this.eventAggregator.publish("handleException", new EventConfigException(`Error birthing DAO: ${config.orgName}`, ex));
        return null;
    }
  }

  public async organizationAt(avatarAddress: string, takeFromCache: boolean = true): Promise<DAO> {
    let dao: DAO;
    let cachedDao = this.daoCache.get(avatarAddress);

    if (!takeFromCache || !cachedDao) {
      try {

        let org = await Organization.at(avatarAddress);

        // if (!org || !org.avatar) {
        //   throw new Error(`DAO at ${avatarAddress} was not found`);
        // }
        dao = await DAO.fromOrganization(org, this.arcService, this.web3);

      } catch(ex) {

        // don't force the user to see this as a snack every time.  A corrupt DAO may never be repaired.  A message will go to the console.
        // this.eventAggregator.publish("handleException", new EventConfigException(`Error loading DAO: ${avatarAddress}`, ex));
        this.eventAggregator.publish("handleException", new EventConfigException(`Error loading DAO: ${avatarAddress}`, ex, undefined, SnackLifetime.none));

        return null;
      }
    } else {
      dao = cachedDao;
    }

    if (!cachedDao) {
      // this.logger.debug(`caching dao: ${dao.name ? `${dao.name}: ` : ""}${dao.address}`);
      this.daoCache.set(dao.address,dao);
    }

    return dao;
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
    let count = eventsArray.length;
    for (let i = 0; i < count; i++) {
        let promotedAmount = 0;
        let avatarAddress =  eventsArray[i].args._avatar;
        // this has side-effects of initializing and caching the dao
        let dao = await this.organizationAt(avatarAddress);
        if (dao) {
          this.logger.debug(`loaded org ${dao.name}: ${dao.address}`);
          /**
           * NOTE: At the time we receive this for a newly-added dao, Arc will likely
           * not yet have added the schemes for the dao.  We will get the notifications
           * when they are, but the delay could be disconcerting for the user.
           * Further, there can be a gap between initially querying for the schemes and 
           * setting up the watch during which a scheme coud be added to the Dao without 
           * us being aware. (see https://github.com/daostack/daostack/issues/132)
           */
          this.publish(OrganizationService.daoAddedEvent, dao);
        }
      }
  }

  public async getSchemesInOrganization(daoAddress: string): Promise<Array<DaoSchemeInfo>> {
    let org = await this.organizationAt(daoAddress);
    return org.allSchemes;
  }

  /*****
   * The following three event methods will be replaced by the event aggregator.
   * See OrganizationService.daoAddedEvent
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
  tokens: number; // in Wei
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

export { DAO } from '../entities/DAO';
export { DaoSchemeInfo } from '../entities/DaoSchemeInfo';
