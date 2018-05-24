Proposal-creating schemes take among their required parameters a voting machine address and a hash of the voting machine's parameters.  Whenever the scheme creates a proposal it passes the voting machine's parameters hash to the voting machine's `propose` method where thenceforth the voting machine uses the hashed parameters to govern its behavior in relation to the proposal.

Here is the trick:  `GenesisProtocol` completely ignores any hashed parameters passed to it in `propose`.  Instead, it always uses the parameters that were stored in the controller when it (the `GenesisProtocol`) was registered.

Thus there is no point in passing a meaningful voting machine parameters hash to schemes that are going to use `GenesisProtocol` as a voting machine.

So, we configure GP when adding it as a scheme to a DAO, or modifying it as a scheme in a DAO.

We configure AV when configuring proposal-generating schemes, including when specifying the default VM for the schemes being added to a new DAO.
