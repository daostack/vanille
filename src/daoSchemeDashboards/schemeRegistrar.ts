import { DaoSchemeDashboard } from "./daoSchemeDashboard"

export class SchemeRegistrar extends DaoSchemeDashboard {

  constructor() {
    super();
  }

  proposeParams = {
        cap: 0, // uint _cap,
        price: 0, // uint _price,
        startBlock: 0, // uint _startBlock,
        endBlock: 0, // uint _endBlock,
        beneficiary: null, // address _beneficiary,
        admin: null,// address _admin)  returns(bytes32) {
      };

    schemeAddressToRegister: string;
    schemeAddressToPropose: string=null;
    schemeAddressToRemove: string;

  // schemeRegistrarParams:  {
  //   voteRegisterParams:string, // bytes32
  //   voteRemoveParams:string, // bytes32
  //   intVote:string // IntVoteInterface
  // }

  // voteParametersHash: string;

  // async activate(model) {
  //   await super.activate(model);
  //   this.voteParametersHash = await this.org.votingMachine.getParametersHash(this.org.reputation.address, options.votePrec, options.ownerVote);
  // }

  proposeScheme() {

  }

  unProposeScheme() {

  }

  registerDAOInScheme() {

  }
}
