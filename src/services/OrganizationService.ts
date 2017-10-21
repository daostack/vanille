import { autoinject } from "aurelia-framework";
import { ArcService } from './ArcService';
import { Web3Service } from "../services/Web3Service";
import  { Organization, getContract } from 'emergent-arc';

@autoinject
export class OrganizationService {

  constructor(
    private arcService: ArcService
    , private web3: Web3Service
  ) {

  }

  private cache = new Map<string,Organization>();

  public async getDAOStackAddress() {
    const schemeRegistrar = await this.arcService.getContract("SchemeRegistrar");
    return await schemeRegistrar.beneficiary();
  }

  public async getDAOStackOrganization() {
      const avatarAddress = await this.getDAOStackAddress();
      const org = await this.organizationAt(avatarAddress);
      return org;
  }


  public async createOrganization(config: OrganizationCreateConfig): Promise<Organization> {
    const org = await Organization.new(config);
    this.cache.set(org.avatar.address,org);
    return org;
  }

  public async organizationAt(avatarAddress: string, fromCache: boolean = true): Promise<Organization> {
    let org: Organization;
    if (!fromCache || !(org = this.cache.get(avatarAddress)) ) {
        org = await Organization.at(avatarAddress);
        this.cache.set(avatarAddress,org);
    }
    return org;
  }

// TODO: move this into the organization class.
  public async organizationName(org: Organization) {
    return this.web3.bytes32ToUtf8(await org.avatar.orgName());     
  }
}

export interface Founder {
  address: string;
  tokens: number;
  reputation: number;
}

export interface OrganizationCreateConfig {
  orgName: string;
  tokenName: string;
  tokenSymbol: string;
  founders: Array<Founder>;
}

export { Organization } from "./ArcService";
