import { autoinject } from "aurelia-framework";
import { Web3Service } from "../services/Web3Service";
import { ArcService } from "../services/ArcService";
import { OrganizationService, Organization, Founder } from "../services/OrganizationService";

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

  constructor(
    private web3: Web3Service
    , private arcService: ArcService
    , private organizationService: OrganizationService
  ) {
      this.userAddress = arcService.defaultAccount;
      this.founders = new Array({ address: this.userAddress, tokens: 1000, reputation: 1000 });
  }

  async activate() {
    /**
     * TODO:  When tknBalance < 5, the html accesses controllerAddrss which, in the original code is undefined
     * until deploySequence is invoked.
     * Here I am initializing to '' which I believe is still not valid.
     */
    return this.readBalances();
  }

    private async readBalances() {
      const token = await this.arcService.getDAOStackMintableToken();
      this.tknBalance = Number(this.web3.fromWei(await token.balanceOf(this.userAddress)));
      this.ethBalance = Number(this.web3.fromWei(this.web3.eth.getBalance(this.userAddress)));
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
  }

  addFounderInput() {
      this.founders.push({ address: '', tokens: 1000, reputation: 1000 });
  }
}
