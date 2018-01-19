import { autoinject } from "aurelia-framework";
import {
  ArcService,
  TruffleContract,
  Organization,
  ContractInfo,
  OrganizationNewConfig,
  FounderConfig,
  OrganizationSchemeInfo
} from "./ArcService";
import { Web3Service } from "../services/Web3Service";
import { includeEventsIn, Subscription } from "aurelia-event-aggregator";
import { LogManager } from "aurelia-framework";
import { DAO } from "../entities/DAO";
import { DaoSchemeInfo } from "../entities/DaoSchemeInfo";
import { DaoSchemeDashboard } from "schemeDashboards/schemeDashboard";
import { EventAggregator } from "aurelia-event-aggregator";
import { EventConfigException, SnackLifetime } from "../entities/GeneralEvents";
import { Observable } from 'rxjs/Observable';

@autoinject
export class OrganizationService {
  constructor(
    private arcService: ArcService,
    private web3: Web3Service,
    private eventAggregator: EventAggregator
  ) {
    includeEventsIn(this);
  }

  private daoCache = new Map<string, DAO>();
  private logger = LogManager.getLogger("Alchemy");
  public promiseToBeLoaded: Promise<any>;
  private _daoStack: DAO;
  private resolvePromiseForDaoStack;
  public promiseForDaoStack: Promise<any> = new Promise((resolve) => { this.resolvePromiseForDaoStack = resolve; });

  public async GetDaostack(): Promise<DAO> {
    return this.promiseForDaoStack;
  }

  /**
   * a DAO has been added or removed
   */
  public static daoAddedEvent: string = "daoSetChanged";

  public async initialize() {
    return (this.promiseToBeLoaded = new Promise(async (resolve, reject) => {
      let genesisScheme = await this.arcService.getContract("GenesisScheme");
      let myEvent = genesisScheme.InitialSchemesSet({}, { fromBlock: 0 });
      /**
       * get():  fires once for all the DAOs in the system; resolve() will be called properly.
       * watch(): fires whenever a new DAO is created thereafter
       */
      myEvent.get((err, eventsArray) =>
        this.handleNewOrg(err, eventsArray).then(() => {
          this.logger.debug("Finished loading daos");
          myEvent = genesisScheme.InitialSchemesSet({}, { fromBlock: "latest" });
          myEvent.watch((err, eventsArray) => this.handleNewOrg(err, eventsArray));
          resolve();
        })
      );
    }));
  }

  public async createOrganization(config: OrganizationNewConfig): Promise<DAO> {
    return this.promiseToBeLoaded.then(async () => {
      let org = await Organization.new(config);
      let dao = this.daoCache.get(org.avatar.address);

      if (!dao) {
        dao = await DAO.fromOrganization(org, this.arcService, this.web3);
        this.daoCache.set(dao.address, dao);
      }

      return dao;
    });
  }

  public async organizationAt(
    avatarAddress: string,
    takeFromCache: boolean = true
  ): Promise<DAO> {
    return this.promiseToBeLoaded.then(async () => {
      return this._organizationAt(avatarAddress, takeFromCache);
    });
  }

  private async _organizationAt(
    avatarAddress: string,
    takeFromCache: boolean = true
  ): Promise<DAO> {
    let dao: DAO;
    let cachedDao = this.daoCache.get(avatarAddress);

    if (!takeFromCache || !cachedDao) {
      try {
        let org = await Organization.at(avatarAddress);

        // if (!org || !org.avatar) {
        //   throw new Error(`DAO at ${avatarAddress} was not found`);
        // }
        dao = await DAO.fromOrganization(org, this.arcService, this.web3);
      } catch (ex) {
        // don't force the user to see this as a snack every time.  A corrupt DAO may never be repaired.  A message will go to the console.
        // this.eventAggregator.publish("handleException", new EventConfigException(`Error loading DAO: ${avatarAddress}`, ex));
        this.eventAggregator.publish("handleException",
          new EventConfigException(`Error loading DAO: ${avatarAddress}`, ex, undefined, SnackLifetime.none));

        return null;
      }
    } else {
      dao = cachedDao;
    }

    if (!cachedDao) {
      // this.logger.debug(`caching dao: ${dao.name ? `${dao.name}: ` : ""}${dao.address}`);
      this.daoCache.set(dao.address, dao);
    }

    return dao;
  }

  public async allOrganizations(): Promise<Array<DAO>> {
    return this.promiseToBeLoaded.then(async () => {
      return Array.from(this.daoCache.values());
    });
  }

  private firstOrg = true;

  private async handleNewOrg(err, eventsArray): Promise<void> {
    let newOrganizationArray = [];
    if (!(eventsArray instanceof Array)) {
      eventsArray = [eventsArray];
    }
    let count = eventsArray.length;
    for (let i = 0; i < count; i++) {
      let promotedAmount = 0;
      let avatarAddress = eventsArray[i].args._avatar;

      /**
       * particularly in ganache, we could end up seeing the same org twice.
       * this is because our two calls to the event, get and watch, may hit
       * the same latest block twice
       */
      let alreadyCached = !!this.daoCache.get(avatarAddress);
      if (!alreadyCached) {
        let dao = await this._organizationAt(avatarAddress);
        if (dao) {
          this.logger.debug(`loaded org ${dao.name}: ${dao.address}`);
          if (this.firstOrg) {
            this._daoStack = this.resolvePromiseForDaoStack(dao);
            this.firstOrg = false;
          }
          this.publish(OrganizationService.daoAddedEvent, dao);
        }
      }
    }
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
  public publish(event: string | any, data?: any): void { }

  /**
   * Subscribes to a message channel or message type.
   * @param event The event channel or event data type.
   * @param callback The callback to be invoked when when the specified message is published.
   */
  public subscribe(event: string | Function, callback: Function): Subscription {
    return null;
  }

  /**
   * Subscribes to a message channel or message type, then disposes the subscription automatically after the first message is received.
   * @param event The event channel or event data type.
   * @param callback The callback to be invoked when when the specified message is published.
   */
  public subscribeOnce(
    event: string | Function,
    callback: Function
  ): Subscription {
    return null;
  }
}

export { DAO } from "../entities/DAO";
export { DaoSchemeInfo } from "../entities/DaoSchemeInfo";
