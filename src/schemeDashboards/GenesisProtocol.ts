import { autoinject } from 'aurelia-framework';
import { DaoSchemeDashboard } from "./schemeDashboard"
import { EventAggregator } from 'aurelia-event-aggregator';
import { ArcService, GenesisProtocolWrapper, Hash } from "../services/ArcService";
import { EventConfigTransaction, EventConfigException } from "../entities/GeneralEvents";
import { BigNumber } from '../services/Web3Service';
import { Utils } from 'services/utils';

@autoinject
export class GenesisProtocolDashboard extends DaoSchemeDashboard {

  parametersHash: Hash;
  votingMachine: GenesisProtocolWrapper;
  threshold: BigNumber;
  boostedCount: BigNumber;
  gettingThreshold: boolean = false;
  gettingBoosted: boolean = false;

  constructor(
    private eventAggregator: EventAggregator
    , private arcService: ArcService
  ) {
    super();
  }

  async attached() {
    this.votingMachine = await this.arcService.arcContracts.GenesisProtocol.factory.at(this.address);
    this.parametersHash = await this.votingMachine.getSchemeParametersHash(this.orgAddress);
    this.refreshThreshold();
    this.refreshBoostedCount();
  }
  async refreshThreshold() {
    this.gettingThreshold = true;
    this.threshold = await this.votingMachine.getThreshold({ avatar: this.orgAddress });
    this.gettingThreshold = false;
  }

  async refreshBoostedCount() {
    this.gettingBoosted = true;
    this.boostedCount = await this.votingMachine.getBoostedProposalsCount(this.orgAddress);
    this.gettingBoosted = false;
  }
}
