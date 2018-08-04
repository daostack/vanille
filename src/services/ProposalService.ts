import { autoinject } from "aurelia-framework";
import { ArcService, ProposalGeneratorBase, Address } from './ArcService';
import { EventAggregator } from 'aurelia-event-aggregator';

@autoinject
export class ProposalService {
  constructor(
    private arcService: ArcService
    , private eventAggregator: EventAggregator
  ) {
  }

  public async getVotableProposals(
    scheme: ProposalGeneratorBase,
    daoAddress: Address) {
    const votingMachine = await scheme.getVotingMachine(daoAddress);
    const watcher = votingMachine.VotableProposals({}, { fromBlock: "latest" });
    return watcher.get();
  }
}
