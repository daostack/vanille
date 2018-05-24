import { autoinject } from "aurelia-framework";
import { TruffleContract, TokenCapGcParams } from '../services/ArcService';
import { VanilleDAO, DaoService } from '../services/DaoService';
import { ArcService } from "../services/ArcService";
import { GlobalConstraintConfigModel } from './globalConstraintConfigModel';

@autoinject
export class TokenCapGC {

  model: any;

  constructor(
    private daoService: DaoService
    , private arcService: ArcService
  ) { }

  async activate(model: Partial<TokenCapGcParams & GlobalConstraintConfigModel>) {
    model.getConfigurationHash = await this.getConfigurationHash.bind(this);
    this.model = Object.assign({ cap: 0 }, model);
  }

  public async getHash(globalConstraint: TruffleContract, org: VanilleDAO) {
    let hash = await globalConstraint.getParametersHash(org.token.address, this.model.cap);
    // don't generate hash without being sure it is usable  (TODO: is this needed/desirable/cost money)?
    await globalConstraint.setParameters(org.token.address, this.model.cap);
    return hash;
  }

  private async getConfigurationHash(orgAddress: string, gcAddress?: string): Promise<any> {

    let dao = await this.daoService.daoAt(orgAddress);

    return await this.arcService.setContractParameters(
      {
        token: dao.token.address,
        cap: this.model.cap
      },
      "TokenCapGC",
      gcAddress);
  }

}
