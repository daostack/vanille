import { autoinject } from "aurelia-framework";
import { GlobalConstraintConfig } from "../services/GlobalConstraintService";
import { TruffleContract } from '../services/ArcService';
import { DAO, OrganizationService } from '../services/OrganizationService';
import { ArcService } from  "../services/ArcService";

@autoinject
export class TokenCapGC implements GlobalConstraintConfig   {

  model: any;

  constructor(
    private organizationService: OrganizationService
    , private arcService: ArcService
  ) {}

  activate(model:any) {
    model.getConfigurationHash = this.getConfigurationHash.bind(this);
    model.cap = (model.cap !== undefined) ? model.cap : 0;
    this.model = model;
  }

  public async getHash(globalConstraint: TruffleContract, org: DAO) {
    let hash = await globalConstraint.getParametersHash(org.token.address, this.model.cap);
    // don't generate hash without being sure it is usable  (TODO: is this needed/desirable/cost money)?
    await globalConstraint.setParameters(org.token.address, this.model.cap);
    return hash;
  }

  async getConfigurationHash(orgAddress: string, gcAddress?: string): Promise<any> {

    let dao = await this.organizationService.organizationAt(orgAddress);
      
    return await this.arcService.setContractParameters(
      {
        token: dao.token.address,
        cap: this.model.cap
      },
      "TokenCapGC",
      gcAddress);
  }

}
