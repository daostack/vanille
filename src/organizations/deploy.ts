import { autoinject } from "aurelia-framework";
import { Web3Service, BigNumber } from "../services/Web3Service";
import { TokenService } from "../services/TokenService";
import { ArcService, ContractInfo, FounderConfig } from "../services/ArcService";
import { OrganizationService, DAO } from "../services/OrganizationService";
import { SchemeService } from  "../services/SchemeService";
import "./deploy.scss";
import { VotingMachineInfo } from "../services/VotingMachineService";
import { EventAggregator  } from 'aurelia-event-aggregator';
import { Router } from 'aurelia-router';
import { EventConfigAction } from "../entities/GeneralEvents";

@autoinject
export class DeployGen  {

  private userAddress: any;
  private founders: Array<MyFounder>;
  private ethBalance:BigNumber = null;
  private tknBalance:BigNumber = null;
  private controllerAddrss= '';

  private orgName:string = '';
  private tokenName:string = '';
  private tokenSymbol:string = '';

  private addOrgResultMessage: string= '';
  private deployOrgStatus:string = null;
  private arcSchemes: Array<ContractInfo>;
  private selectedSchemes: Array<ContractInfo> = [];
  private votingMachineInfo: VotingMachineInfo = null;
  private votingMachineModel:any = {};
  private myView: any;

  constructor(
    private web3: Web3Service
    , private arcService: ArcService
    , private organizationService: OrganizationService
    , private tokenService: TokenService
    , private schemeService: SchemeService
    , private eventAggregator: EventAggregator
    , private router: Router
  ) {
      this.userAddress = arcService.defaultAccount;
      this.founders = new Array();
      this.arcSchemes = this.schemeService.availableSchemes;
      for(let scheme of this.arcSchemes) {
        if (scheme.name !== "ContributionReward")
        {
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
      const token = await this.tokenService.getDAOStackMintableToken();

      this.tknBalance = (await this.tokenService.getUserTokenBalance(token, true));
      this.ethBalance = (await this.web3.getBalance(this.userAddress, true));
      // console.log(`token balance: ${this.tknBalance}`);
      // console.log(`eth balance: ${this.ethBalance}`);
  }

  async deploy() {
    this.deployOrgStatus = 'deploying';
    this.addOrgResultMessage= 'adding_org';
    try {

      const organization = await this.organizationService.createOrganization({
        orgName: this.orgName,
        tokenName: this.tokenName,
        tokenSymbol: this.tokenSymbol,
        founders: this.founders
        , votingMachine: this.votingMachineInfo.address
        , votePrec: this.votingMachineModel.votePrec
        , ownerVote: this.votingMachineModel.ownerVote
        , schemes: this.selectedSchemes.map((s) => { return { name: s.name, address: s.address }; } )
      });
      this.deployOrgStatus= 'deployed';
      this.addOrgResultMessage= 'org_added';
      this.eventAggregator.publish("handleSuccess", new EventConfigAction(
          `${this.orgName} has been successfully deployed!`
          , "See The New DAO"
          , () => { this.router.navigateToRoute("daoDashboard", {address: organization.address}); }
        ));

      // console.log('permissions: ' + await organization.controller.getSchemePermissions(this.arcService.arcContracts.GlobalConstraintRegistrar.address));
      // const avatarAddress = organization.avatar.address;
      // let testOrg = await this.organizationService.organizationAt(avatarAddress, false);
      // console.log(`org: ${organization.avatar.address}, testOrg: ${testOrg.avatar.address}`)
      // console.log('testOrg permissions: ' + await testOrg.controller.getSchemePermissions(this.arcService.arcContracts.GlobalConstraintRegistrar.address));
      // let schemes = await testOrg.schemes("GlobalConstraintRegistrar");
      // console.log('testOrg from scheme() permissions: ' + schemes.filter((s) => s.contract === "GlobalConstraintRegistrar")[0].permissions);
      // testOrg = await this.organizationService.organizationAt(avatarAddress, true);
      // console.log(`org: ${organization.avatar.address}, cached testOrg: ${testOrg.avatar.address}`)

    }
    catch(ex) {
      this.deployOrgStatus= 'error';    
      this.addOrgResultMessage= ex;
       this.eventAggregator.publish("handleException", ex);
    }
  }

  removeFounder(idx: number) {
    if (this.founders.length > 1) {
      this.founders.splice(idx, 1);
    }
    ($(".founder-delete-button") as any).tooltip("dispose");
  }

  addFounderInput(founder:MyFounder) {
      this.founders.push(founder || new MyFounder(this.web3, null));
      setTimeout(() => { ($(".founder-delete-button") as any).tooltip(); });
      // setTimeout(() => { 
      //   (<any>$(".founders")).bootstrapMaterialDesign();
      //  },200);
    }

  appendIndex(str:string, ndx:number):string {
    return str+ndx;
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
  reputation : BigNumber;
}
