import { autoinject, observable } from "aurelia-framework";
import { Web3Service, BigNumber } from "../services/Web3Service";
import { TokenService } from "../services/TokenService";
import { ArcService, ContractWrapperInfo, FounderConfig } from "../services/ArcService";
import { DaoService, VanilleDAO } from "../services/DaoService";
import { SchemeService } from "../services/SchemeService";
import "./deploy.scss";
import { VotingMachineInfo } from "../services/VotingMachineService";
import { EventAggregator } from 'aurelia-event-aggregator';
import { Router } from 'aurelia-router';
import { EventConfigAction } from "../entities/GeneralEvents";
import { SortService } from "../services/SortService";

@autoinject
export class DeployGen {

  [x: string]: any;
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
  private arcSchemes: Array<ContractWrapperInfo>;
  private selectedSchemes: Array<ContractWrapperInfo> = [];
  @observable private votingMachineInfo: VotingMachineInfo = null;
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
    this.userAddress = this.web3.defaultAccount;
    this.founders = new Array();
    this.arcSchemes = this.schemeService.availableSchemes.sort(
      (a, b) => { return SortService.evaluateString(a.name, b.name); }
    );
  }

  async activate() {
    /**
     * TODO:  When tknBalance < 5, the html accesses controllerAddrss which, in the original code is undefined
     * until deploySequence is invoked.
     * Here I am initializing to '' which I believe is still not valid.
     */
    // return this.readBalances();
  }

  attached() {
    this.addFounderInput(new MyFounder(this.web3, this.userAddress));
    ($(".founder-add-button") as any).tooltip();
    this.selectedSchemes.push(this.arcSchemes.filter((s) => s.name === "SchemeRegistrar")[0]);
  }

  private votingMachineInfoChanged() {
    if (this.votingMachineInfo) {
      const gp = this.arcSchemes.filter((s) => s.name === "GenesisProtocol")[0] as DeploySchemeInfo;
      const ndxGp = this.selectedSchemes.indexOf(gp);
      const isSelected = ndxGp !== -1;
      if (this.votingMachineInfo.name === "GenesisProtocol") {
        gp.wasSelected = isSelected;
        if (!gp.wasSelected) {
          this.selectedSchemes.push(gp);
        }
        gp.required = true;
      } else {
        if (!gp.wasSelected && isSelected) {
          this.selectedSchemes.splice(ndxGp, 1);
        }
        gp.required = false;
      }
    }
  }

  // private async readBalances() {
  //   const token = await this.tokenService.getDAOstackNativeToken();

  //   this.tknBalance = (await this.tokenService.getUserTokenBalance(token, true));
  //   this.ethBalance = (await this.web3.getBalance(this.userAddress, true));
  // }

  async deploy() {
    this.deployOrgStatus = 'deploying';
    this.addOrgResultMessage = 'adding_org';
    try {

      const organization = await this.daoService.createDAO({
        name: this.orgName,
        tokenName: this.tokenName,
        tokenSymbol: this.tokenSymbol,
        founders: this.founders,
        votingMachineParams: Object.assign({
          votingMachineName: this.votingMachineInfo.name
          , votingMachineAddress: this.votingMachineInfo.address
        },
          this.votingMachineModel)
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

interface DeploySchemeInfo extends ContractWrapperInfo {
  wasSelected: boolean;
  required: boolean;
}

class MyFounder implements FounderConfig {

  constructor(web3: Web3Service, address: string) {
    this.address = address;
    this.tokens = web3.toWei(1000);
    this.reputation = web3.toWei(1000);
  }

  address: string;
  tokens: BigNumber;
  reputation: BigNumber;
}
