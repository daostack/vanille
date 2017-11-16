import { GlobalConstraintConfig } from "../services/GlobalConstraintService";
import { TruffleContract } from '../services/ArcService';
import { DAO } from '../services/OrganizationService';

export class TokenCapGC implements GlobalConstraintConfig   {

  model: any;

  activate(model:any) {
    model.getHash = this.getHash.bind(this);
    model.cap = (model.cap !== undefined) ? model.cap : 0;
    this.model = model;
  }

  public async getHash(globalConstraint: TruffleContract, org: DAO) {
    return await globalConstraint.getParametersHash(org.token.address, this.model.cap);
  }

}
