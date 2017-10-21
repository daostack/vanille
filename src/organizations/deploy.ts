import { autoinject } from "aurelia-framework";
import { Web3Service } from "../services/Web3Service";
import { ArcService, Organization, Founder } from "../services/ArcService";

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
    private web3: Web3Service,
    // private contractService: TruffleContractService,
    private arcService: ArcService    
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
      const organization = await this.arcService.createOrganization({
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

  /* 
  deploySequence = () => {
    const DAOstack = this.web3.DAOstack;
    const web3 = this.web3;
    const addressArray = this.addressArray();
    const tokensArray = this.tokensArray();
    const reputationsArray = this.reputationsArray();
    const SimpleVoteCont = this.contractService.contract(SimpleVote);
    const GenesisCont = this.contractService.contract(Genesis);
    const OrganizationsBoardCont = this.contractService.contract(OrganizationsBoard);
    SimpleVoteCont.setProvider(web3.currentProvider);
    GenesisCont.setProvider(web3.currentProvider);
    OrganizationsBoardCont.setProvider(web3.currentProvider);

    this.deployOrgStatus = this.simpleVoteDeployMessage = 'deploying';
    
    SimpleVoteCont.new({ from: this.this.userAddress, gas: 3000000 }).then(inst => {
      this.simpleVoteDeployMessage= 'deployed';
      this.simpleVoteContractAddress = inst.address;
      return inst.address;
    }).then(simpleVoteAddrss => {
      this.genesisDeployMessage= 'deploying';
      return GenesisCont.new(this.tokenName, this.tokenSymbol, addressArray, tokensArray, reputationsArray, simpleVoteAddrss, { from: this.this.userAddress, gas: 4000000 });
    }).then(genInst => {
      this.genesisDeployMessage= 'deployed';
      this.genesisContractAddress= genInst.address;
      return genInst.controller.call();
    }).then(controllerAddrss => {
      this.addOrgToIndexMessage= 'adding_org';
      OrganizationsBoardCont.at(DAOstack.orgBoard).then(inst => {
        return inst.addOrg(controllerAddrss, this.tokenName, { from: web3.eth.accounts[0], gas: 200000 });
      }).then(() => {
        this.controllerAddrss= controllerAddrss;
        this.deployOrgStatus= 'deployed';
        this.addOrgToIndexMessage= 'org_added';
      }).then(() => {}, (err) => {
        console.log(err);
        this.deployOrgStatus= 'error';
        this.addOrgToIndexMessage= 'org_error';
      })
    })
  }
  */

  removeCollaborator(idx: number) {
    if (this.founders.length > 1) {
      this.founders.splice(idx, 1);
    }
  }

  addCollaboratorInput() {
      this.founders.push({ address: '', tokens: 1000, reputation: 1000 });
  }

  /*
  addressArray(): Array<string> {
    return this.collaborators.map((collaborator, sidx) => {
      return collaborator.address;
    });
  }

  tokensArray(): Array<Object|string> {
    const web3 = this.web3;
    return this.collaborators.map((collaborator, sidx) => {
      return web3.toWei(collaborator.tokens)
    });
  }

  reputationsArray(): Array<Object|string> {
    const web3 = this.web3;
    return this.collaborators.map((collaborator, sidx) => {
      return web3.toWei(collaborator.reputation)
    });
  }
  */

  
  // pieChartData () {
  //   return this.collaborators.map((collaborator, sidx) => {
  //     return { address: collaborator.address, tokens: collaborator.tokens }
  //   })
  // }


  // renderDistrbutionCharts () {
  //   const { collaborators } = this.state
  //   return (
  //     <div>
  //       <h3 className='text-center'>Tokens Distribution</h3>
  //       <VictoryPie
  //         data={ collaborators }
  //         x='address'
  //         y={ datum => datum.tokens }
  //         />
  //       <h3 className='text-center'>Reputation Distribution</h3>
  //       <VictoryPie
  //         data={ collaborators }
  //         x='address'
  //         y={ datum => datum.reputation }
  //         />
  //     </div>
  //   )
  // }
}
