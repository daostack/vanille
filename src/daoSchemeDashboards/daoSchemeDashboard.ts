import { TruffleContract } from '../services/ArcService';

export class DaoSchemeDashboard {
    /**
     * ready-to-use TruffleContract
     */
    contract: TruffleContract;
    address: string;
    /**
     * Pretty name
     */
    name: string;
    /**
     * short name (used by ArcService.getContract())
     */
    key: string;
    activate(model) {
      this.name = model.name;
  }
}
