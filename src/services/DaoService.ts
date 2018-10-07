import { autoinject } from "aurelia-framework";
import {
  ArcService,
  DAO,
  NewDaoConfig,
  SchemesConfig,
  Address
} from "./ArcService";
import { Web3Service } from "../services/Web3Service";
import { includeEventsIn, Subscription } from "aurelia-event-aggregator";
import { LogManager } from "aurelia-framework";
import { VanilleDAO } from "../entities/DAO";
import { EventAggregator } from "aurelia-event-aggregator";
import { EventConfigException, SnackLifetime } from "../entities/GeneralEvents";

@autoinject
export class DaoService {
  constructor(
    private arcService: ArcService,
    private web3: Web3Service,
    private eventAggregator: EventAggregator
  ) {
    includeEventsIn(this);
  }

  private daoCache = new Map<string, VanilleDAO>();
  private discoveredDAOs = new Set<string>();
  private logger = LogManager.getLogger("Vanille");
  public promiseToBeLoaded: Promise<any>;
  /**
   * a DAO has been added or removed
   */
  public static daoAddedEvent: string = "daoSetChanged";

  public async initialize() {
    return (this.promiseToBeLoaded = new Promise(async (resolve, reject) => {
      try {
        let existingAvatarAddresses = await DAO.getDaos();
        for (const avatarAddress of existingAvatarAddresses) {
          this.newDaoDiscovered(avatarAddress);
        }

        /**
         * Note that DAO.getDaos and DAO.getDaoCreationEvents can potentially overlap by one block here.  Any DAOs
         * created within that block will thus show up twice.
         */
        const daoFetcher = (await DAO.getDaoCreationEvents())({}, { fromBlock: "latest" });

        daoFetcher.watch((error: Error, avatarAddress: Address) => this.newDaoDiscovered(avatarAddress));

        this.logger.debug("Finished loading daos");
        resolve();

      } catch (ex) {
        this.logger.error(`Error obtaining DAO ecosystem: ${ex}`);
        alert(`Error obtaining DAO ecosystem: ${ex}`);
        reject(ex);
      }
    }));
  }

  public async createDAO(config: NewDaoConfig & SchemesConfig): Promise<DAO> {
    return this.promiseToBeLoaded.then(async () => {
      return DAO.new(config);
    });
  }

  public async daoAt(
    avatarAddress: string,
    takeFromCache: boolean = true
  ): Promise<VanilleDAO> {
    return this.promiseToBeLoaded.then(async () => {
      return this._daoAt(avatarAddress, takeFromCache);
    });
  }

  private async _daoAt(
    avatarAddress: string,
    takeFromCache: boolean = true
  ): Promise<VanilleDAO> {
    let dao: VanilleDAO;
    let cachedDao = this.daoCache.get(avatarAddress);

    if (!takeFromCache || !cachedDao) {
      try {
        const org = await DAO.at(avatarAddress);

        if (org) {
          dao = await VanilleDAO.fromArcJsDao(org, this.arcService, this.web3);
          this.logger.debug(`loaded dao ${dao.name}: ${dao.address}`);
        } // else error will already have been logged by arc.js
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

    if (dao && !cachedDao) {
      this.daoCache.set(dao.address, dao);
    }

    return dao;
  }

  public async allDAOs(): Promise<Array<VanilleDAO>> {
    return this.promiseToBeLoaded.then(async () => {
      return Array.from(this.daoCache.values());
    });
  }

  private async newDaoDiscovered(avatarAddress: Address): Promise<void> {
    /**
     * particularly in ganache, we could end up seeing the same org twice.
     * this is because our two calls to the event, get and watch, may hit
     * the same latest block twice
     */
    let alreadyCached = this.discoveredDAOs.has(avatarAddress);
    if (!alreadyCached) {
      this.discoveredDAOs.add(avatarAddress);
      let dao = await this._daoAt(avatarAddress);
      if (dao) {
        this.logger.debug(`discovered dao ${dao.name}: ${dao.address}`);
        this.publish(DaoService.daoAddedEvent, dao);
      }
    }
  }

  /*****
   * The following three event methods will be replaced by the event aggregator.
   * See DaoService.daoAddedEvent
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

export { VanilleDAO } from "../entities/DAO";
