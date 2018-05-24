import { autoinject } from 'aurelia-framework';
import { DaoSchemeDashboard } from "./schemeDashboard"
import { EventAggregator } from 'aurelia-event-aggregator';
import { ArcService, GenesisProtocolWrapper } from "../services/ArcService";
import { EventConfigTransaction, EventConfigException } from "../entities/GeneralEvents";
import { BigNumber } from '../services/Web3Service';

@autoinject
export class GenesisProtocolDashboard extends DaoSchemeDashboard {

  constructor(
    private eventAggregator: EventAggregator
    , private arcService: ArcService
  ) {
    super();
  }
}
