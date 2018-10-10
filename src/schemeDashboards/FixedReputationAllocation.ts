import { autoinject } from 'aurelia-framework';
import { DaoSchemeDashboard } from "./schemeDashboard"
import { EventAggregator } from 'aurelia-event-aggregator';
import {
  WrapperService,
  Address,
  FixedReputationAllocationWrapper
} from "../services/ArcService";
import { EventConfigTransaction, EventConfigException } from "../entities/GeneralEvents";
import { BigNumber, Web3Service } from '../services/Web3Service';
import { SchemeDashboardModel } from 'schemeDashboards/schemeDashboardModel';

@autoinject
export class FixedReputationAllocation extends DaoSchemeDashboard {

  protected wrapper: FixedReputationAllocationWrapper;
  isEnabled: boolean;
  numBeneficiaries: number;
  totalReputationRewardable: BigNumber;
  totalBeneficiaryRewardable: BigNumber;
  refreshing: boolean = false;

  constructor(
    protected eventAggregator: EventAggregator
    , protected web3Service: Web3Service
  ) {
    super();
  }

  async activate(model: SchemeDashboardModel) {
    this.wrapper = await WrapperService.factories[model.name].at(model.address);
    return this.refresh();
  }

  protected async refresh() {
    this.refreshing = true;
    this.isEnabled = await this.wrapper.getIsEnable();
    this.totalReputationRewardable = await this.wrapper.getReputationReward();
    this.totalBeneficiaryRewardable = await this.wrapper.getBeneficiaryReward();
    this.numBeneficiaries = await this.wrapper.getNumberOfBeneficiaries();
    this.refreshing = false;
  }

  protected async setEnabled() {
    const confirmed = confirm(`After enabling you will no longer be able to add beneficiaries.  Proceed anyway?`)
    if (confirmed) {
      try {
        let result = await this.wrapper.setEnabled();

        this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
          `successfully enabled`, result.tx));

      } catch (ex) {
        this.eventAggregator.publish("handleException", new EventConfigException(`Error enabling`, ex));
      }
    }
  }

  protected async addBeneficiary(beneficiaryAddress: Address) {

    const confirmed = confirm(`It is not possible to remove a beneficiary once added.  Proceed anyway?`)
    if (confirmed) {

      try {

        let result = await this.wrapper.addBeneficiary({ beneficiaryAddress });

        this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
          `Benficiary added: ${beneficiaryAddress}`, result.tx));

      } catch (ex) {
        this.eventAggregator.publish("handleException", new EventConfigException(`Error adding beneficiary: ${beneficiaryAddress}`, ex));
      }
    }
  }

  protected async addBeneficiaries(beneficiaries: string = "") {

    const confirmed = confirm(`It is not possible to remove beneficiaries once added.  Proceed anyway?`)
    if (confirmed) {

      try {

        /**
         * split by commas and whitespace.  Assumes no empty addresses.
         */
        const beneficiaryAddresses = beneficiaries.split(/\s*,\s*/);

        let result = await this.wrapper.addBeneficiaries({ beneficiaryAddresses });

        this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
          `Benficiary added: ${beneficiaries}`, result.tx));

      } catch (ex) {
        this.eventAggregator.publish("handleException", new EventConfigException(`Error adding beneficiary: ${beneficiaries}`, ex));
      }
    }
  }

  protected async redeem(beneficiaryAddress: Address) {

    try {

      let result = await this.wrapper.addBeneficiary({ beneficiaryAddress });

      this.eventAggregator.publish("handleSuccess", new EventConfigTransaction(
        `Redeemed for: ${beneficiaryAddress}`, result.tx));

    } catch (ex) {
      this.eventAggregator.publish("handleException", new EventConfigException(`Error redeeming for: ${beneficiaryAddress}`, ex));
    }
  }
}
