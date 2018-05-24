import { autoinject } from "aurelia-framework";
import { VanilleDAO, DaoService } from '../services/DaoService';
import { ArcService, GenesisProtocolParams, Address, GetDefaultGenesisProtocolParameters } from "../services/ArcService";
import { VotingMachineConfigModel } from './votingMachineConfigModel';
import { SOME_HASH, NULL_HASH } from 'services/Web3Service';

@autoinject
export class GenesisProtocol {

  model: Partial<GenesisProtocolParams> = {};

  constructor(
    private daoService: DaoService
    , private arcService: ArcService
  ) { }

  async activate(model: Partial<GenesisProtocolParams & VotingMachineConfigModel>) {
    model.getConfigurationHash = await this.getConfigurationHash.bind(this);
    /**
     * we want to keep the params in the passed-in model,
     * and add the default values to it.
     */
    // Object.assign(this.model, await GetDefaultGenesisProtocolParameters(), model);
  }

  private async getConfigurationHash(orgAddress: Address, votingMachineAddress?: Address): Promise<any> {
    /**
     * We don't store real GenesisProtocol params with schemes.  These schemes just ignore it.  GenesisProtocol
     * itself uses the params stored in the controller when it (GP) is registered as a scheme.
     */
    return Promise.resolve(NULL_HASH);
    // return await this.arcService.setContractParameters(
    //   this.model,
    //   "GenesisProtocol",
    //   votingMachineAddress);
  }
}
