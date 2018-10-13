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
  private logger = LogManager.getLogger("Vanille");

  public async daoAt(
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
}

export { VanilleDAO } from "../entities/DAO";
