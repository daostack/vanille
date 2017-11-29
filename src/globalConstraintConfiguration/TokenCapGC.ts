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
    let hash = await globalConstraint.getParametersHash(org.token.address, this.model.cap);
    // don't generate hash without being sure it is usable  (TODO: is this needed/desirable/cost money)?
    await globalConstraint.setParameters(org.token.address, this.model.cap);
    return hash;
  }

}
