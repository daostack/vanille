import { autoinject } from "aurelia-framework";
import { Web3Service, BigNumber } from "../services/Web3Service";
import { TokenService } from "../services/TokenService";
import { ArcService, ContractInfo, FounderConfig } from "../services/ArcService";
import { DaoService, DAO } from "../services/DaoService";
import { SchemeService } from "../services/SchemeService";
import "./deploy.scss";
import { VotingMachineInfo } from "../services/VotingMachineService";
import { EventAggregator } from 'aurelia-event-aggregator';
import { Router } from 'aurelia-router';
import { EventConfigAction } from "../entities/GeneralEvents";

@autoinject
export class DeployGen {

  private userAddress: any;
  private founders: Array<MyFounder>;
  private ethBalance: BigNumber = null;
  private tknBalance: BigNumber = null;
  private controllerAddrss = '';

  private orgName: string = '';
  private tokenName: string = '';
  private tokenSymbol: string = '';

  private addOrgResultMessage: string = '';
  private deployOrgStatus: string = null;
  private arcSchemes: Array<ContractInfo>;
  private selectedSchemes: Array<ContractInfo> = [];
  private votingMachineInfo: VotingMachineInfo = null;
  private votingMachineModel: any = {};
  private myView: any;

  constructor(
    private web3: Web3Service
    , private arcService: ArcService
    , private daoService: DaoService
    , private tokenService: TokenService
    , private schemeService: SchemeService
    , private eventAggregator: EventAggregator
    , private router: Router
  ) {
    this.userAddress = arcService.defaultAccount;
    this.founders = new Array();
    this.arcSchemes = this.schemeService.availableSchemes;
    for (let scheme of this.arcSchemes) {
      if (scheme.name !== "ContributionReward") {
        (<DeploySchemeInfo>scheme).required = true;
        this.selectedSchemes.push(scheme);
      }
    }

  }

  async activate() {
    /**
     * TODO:  When tknBalance < 5, the html accesses controllerAddrss which, in the original code is undefined
     * until deploySequence is invoked.
     * Here I am initializing to '' which I believe is still not valid.
     */
    return this.readBalances();
  }

  attached() {
    this.addFounderInput(new MyFounder(this.web3, this.userAddress));
    ($(".founder-add-button") as any).tooltip();
  }

  private async readBalances() {
    const token = await this.tokenService.getDAOstackNativeToken();

    this.tknBalance = (await this.tokenService.getUserTokenBalance(token, true));
    this.ethBalance = (await this.web3.getBalance(this.userAddress, true));
  }

  async deploy() {
    this.deployOrgStatus = 'deploying';
    this.addOrgResultMessage = 'adding_org';
    try {

      const organization = await this.daoService.createOrganization({
        orgName: this.orgName,
        tokenName: this.tokenName,
        tokenSymbol: this.tokenSymbol,
        founders: this.founders
        , votingMachine: this.votingMachineInfo.address
        , votePrec: this.votingMachineModel.votePrec
        , ownerVote: this.votingMachineModel.ownerVote
        , schemes: this.selectedSchemes.map((s) => { return { name: s.name, address: s.address }; })
      });
      this.deployOrgStatus = 'deployed';
      this.addOrgResultMessage = 'org_added';
      this.eventAggregator.publish("handleSuccess", new EventConfigAction(
        `${this.orgName} has been successfully deployed!`
        , "See The New DAO"
        , () => { this.router.navigateToRoute("daoDashboard", { address: organization.avatar.address }); }
      ));

    }
    catch (ex) {
      this.deployOrgStatus = 'error';
      this.addOrgResultMessage = ex;
      this.eventAggregator.publish("handleException", ex);
    }
  }

  removeFounder(idx: number) {
    if (this.founders.length > 1) {
      this.founders.splice(idx, 1);
    }
    ($(".founder-delete-button") as any).tooltip("dispose");
  }

  addFounderInput(founder: MyFounder) {
    this.founders.push(founder || new MyFounder(this.web3, null));
    setTimeout(() => { ($(".founder-delete-button") as any).tooltip(); });
  }

  appendIndex(str: string, ndx: number): string {
    return str + ndx;
  }
}

interface DeploySchemeInfo extends ContractInfo {
  required: boolean;
}

class MyFounder implements FounderConfig {

  web3: Web3Service;

  constructor(web3: Web3Service, address: string) {
    this.web3 = web3;
    this.address = address;
    this.tokens = this.web3.toWei(1000);
    this.reputation = this.web3.toWei(1000);
  }

  address: string;
  tokens: BigNumber;
  reputation: BigNumber;
}
