import { autoinject } from 'aurelia-framework';
import { SchemeConfigModel } from './schemeConfigModel';
import { VotingMachineInfo } from '../services/VotingMachineService';
import { ArcService, GenesisProtocolParams, Address, GetDefaultGenesisProtocolParameters } from "../services/ArcService";

@autoinject
export class GenesisProtocol {

  private model: Partial<GenesisProtocolParams> = {};

  constructor(
    private arcService: ArcService
  ) {
  }

  async activate(model: Partial<GenesisProtocolParams & SchemeConfigModel>) {
    model.getConfigurationHash = await this.getConfigurationHash.bind(this);
    /**
     * we want to keep the params in the passed-in model,
     * and add the default values to it.
     */
    Object.assign(this.model, await GetDefaultGenesisProtocolParameters(), model);
  }

  private async getConfigurationHash(orgAddress: string, schemeAddress?: string): Promise<any> {
    return await this.arcService.setContractParameters(
      this.model,
      "GenesisProtocol",
      schemeAddress);
  }
}
