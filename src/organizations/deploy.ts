import { autoinject } from "aurelia-framework";
import { Web3Service } from "../services/Web3Service";
import { TokenService } from "../services/TokenService";
import { ArcService, ContractInfo } from "../services/ArcService";
import { OrganizationService, DAO, Founder } from "../services/OrganizationService";
import { SchemeService, SchemeInfo } from  "../services/SchemeService";
import "./deploy.scss";

@autoinject
export class DeployGen  {

  private userAddress: any;
  private founders: Array<Founder>;
  private ethBalance:number = null;
  private tknBalance:number = null;
  private controllerAddrss= '';

  private orgName:string = '';
  private tokenName:string = '';
  private tokenSymbol:string = '';

  private addOrgResultMessage: string= '';
  private deployOrgStatus:string = null;
  private arcSchemes: Array<SchemeInfo>;
  private selectedSchemes: Array<SchemeInfo> = [];

  constructor(
    private web3: Web3Service
    , private arcService: ArcService
    , private organizationService: OrganizationService
    , private tokenService: TokenService
    , private schemeService: SchemeService
  ) {
      this.userAddress = arcService.defaultAccount;
      this.founders = new Array();
      this.arcSchemes = this.schemeService.availableSchemes;
      for(let scheme of this.arcSchemes) {
        if (scheme.key !== "SimpleContributionScheme")
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
    this.addFounderInput({ address: this.userAddress, tokens: 1000, reputation: 1000 });
    ($(".founder-add-button") as any).tooltip();
  }

  private async readBalances() {
      const token = await this.tokenService.getDAOStackMintableToken();

      this.tknBalance = (await this.tokenService.getUserTokenBalance(token));
      this.ethBalance = (await this.web3.getBalance(this.userAddress));
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
        // , schemes: this.selectedSchemes.map((s) => { return { contract: s.key, address: s.address }; } )
      });
      this.deployOrgStatus= 'deployed';
      this.addOrgResultMessage= 'org_added';

      // const avatarAddress = organization.avatar.address;
      // let testOrg = await this.arcService.organizationAt(avatarAddress, false);
      // console.log(`org: ${organization.avatar.address}, testOrg: ${testOrg.avatar.address}`)
      // testOrg = await this.arcService.organizationAt(avatarAddress, true);
      // console.log(`org: ${organization.avatar.address}, cached testOrg: ${testOrg.avatar.address}`)

    }
    catch(ex) {
      this.deployOrgStatus= 'error';    
      // console.log(ex);
      this.addOrgResultMessage= ex;
    }
  }

  removeFounder(idx: number) {
    if (this.founders.length > 1) {
      this.founders.splice(idx, 1);
    }
    ($(".founder-delete-button") as any).tooltip("dispose");
  }

  addFounderInput(founder:Founder = { address: null, tokens: 1000, reputation: 1000 }) {
      this.founders.push(founder);
      setTimeout(() => { ($(".founder-delete-button") as any).tooltip(); });
    }

  appendIndex(str:string, ndx:number):string {
    return str+ndx;
  }
}

interface DeploySchemeInfo extends SchemeInfo {
  required: boolean;
}
