const C = require('../constants');
const { getSignature } = require('../helpers');
const setup = require('../fixtures');
const { expect } = require('chai');
const { time } = require('@nomicfoundation/hardhat-network-helpers');
const { createTree, getProof } = require('../merkleGenerator');
const { ethers } = require('hardhat');
const { v4: uuidv4, parse: uuidParse } = require('uuid');

const multiClaimDelegateTests = (params) => {
  let deployed, dao, a, b, c, d, e, token, tokenDomain, claimContract, lockup, vesting, claimDomain;
  let start, cliff, period, periods, end, feeAmount, treasury;
  let amount,
    root,
    campaign,
    claimLockup,
    claimA,
    claimB,
    claimC,
    claimD,
    claimE,
    firstId,
    secondId,
    thirdId,
    fourthId,
    uuid;
  it('DAO creates two campaigns, one unlocked and one locked and single claimer is able to claim from both', async () => {
    deployed = await setup(params.decimals);
    dao = deployed.dao;
    a = deployed.a;
    b = deployed.b;
    c = deployed.c;
    d = deployed.d;
    e = deployed.e;
    treasury = deployed.treasury;
    feeAmount = BigInt(7) * BigInt(10 ** 15);
    token = deployed.token;
    claimContract = deployed.claimContract;
    lockup = deployed.lockup;
    vesting = deployed.vesting;
    claimDomain = deployed.claimDomain;
    tokenDomain = deployed.tokenDomain;
    await token.approve(claimContract.target, BigInt(10 ** params.decimals) * BigInt(1000000));
    let treevalues = [];
    amount = BigInt(0);
    uuid = uuidv4();
    firstId = uuidParse(uuid);
    for (let i = 0; i < params.totalRecipients; i++) {
      let wallet;
      let amt = C.randomBigNum(1000, 10, params.decimals);
      if (i == params.nodeA) {
        wallet = a.address;
        claimA = amt;
      } else if (i == params.nodeB) {
        wallet = b.address;
        claimB = amt;
      } else if (i == params.nodeC) {
        wallet = c.address;
        claimC = amt;
      } else if (i == params.nodeD) {
        wallet = d.address;
        claimD = amt;
      } else if (i == params.nodeE) {
        wallet = e.address;
        claimE = amt;
      } else {
        wallet = ethers.Wallet.createRandom().address;
      }
      amount = amt + amount;
      treevalues.push([wallet, amt.toString()]);
    }
    root = createTree(treevalues, ['address', 'uint256']);
    let now = BigInt(await time.latest());
    start = now;
    end = BigInt(60 * 60 * 24 * 7) + now;
    campaign = {
      manager: dao.address,
      token: token.target,
      amount,
      start,
      end,
      tokenLockup: 0,
      root,
      delegating: true,
    };
    await claimContract.createUnlockedCampaign(firstId, campaign, BigInt(treevalues.length));
    claimLockup = {
      tokenLocker: lockup.target,
      start: now,
      cliff: now,
      period: BigInt(1),
      periods: BigInt(1000),
    };
    campaign.tokenLockup = 1;
    uuid = uuidv4();
    secondId = uuidParse(uuid);
    await claimContract.createLockedCampaign(secondId, campaign, claimLockup, dao.address, BigInt(treevalues.length));
    let proof = getProof('./test/trees/tree.json', a.address);
    let delegatee = a.address;
    let expiry = BigInt(await time.latest()) + BigInt(60 * 60 * 24 * 7);
    let nonce = 0;
    const delegationValues = {
      delegatee,
      nonce,
      expiry,
    };
    const delegationSignature = await getSignature(a, tokenDomain, C.delegationtype, delegationValues);

    const delegationSig = {
      nonce,
      expiry,
      v: delegationSignature.v,
      r: delegationSignature.r,
      s: delegationSignature.s,
    };
    let treasuryBalance = BigInt(await ethers.provider.getBalance(treasury.address));
    let tx = await claimContract
      .connect(a)
      .claimAndDelegateMultiple(
        [firstId, secondId],
        [proof, proof],
        [claimA, claimA],
        [delegatee, b.address],
        [delegationSig, delegationSig],
        { value: feeAmount }
      );
    expect(tx)
      .to.emit(claimContract, 'UnlockedTokensClaimed')
      .withArgs(firstId, a.address, claimA, amount - claimA);
    expect(tx)
      .to.emit(claimContract, 'LockedTokensClaimed')
      .withArgs(secondId, a.address, claimA, amount - claimA);
    expect(tx).to.emit(token, 'Transfer').withArgs(claimContract.target, a.address, claimA);
    expect(tx).to.emit(token, 'Transfer').withArgs(claimContract.target, lockup.target, claimA);
    expect(tx).to.emit(lockup, 'PlanCreated');
    expect(await token.balanceOf(a.address)).to.equal(claimA);
    expect(await token.balanceOf(lockup.target)).to.equal(0);
    let votingVault = await lockup.votingVaults(1);
    expect(await token.balanceOf(votingVault)).to.eq(claimA);
    expect(await token.balanceOf(claimContract.target)).to.equal((amount - claimA) * BigInt(2));
    expect(await lockup.ownerOf('1')).to.eq(a.address);
    expect(await token.delegates(a.address)).to.eq(a.address);
    expect(await token.delegates(votingVault)).to.eq(b.address);
    expect(await ethers.provider.getBalance(claimContract.target)).to.eq(0);
    let paidTreasury = BigInt(await ethers.provider.getBalance(treasury.address));
    expect(paidTreasury).to.eq(treasuryBalance + feeAmount);
  });
  it('DAO creates another unlocked campaign, and user b is able to claim two unlocked campaigns', async () => {
    campaign.tokenLockup = 0;
    uuid = uuidv4();
    thirdId = uuidParse(uuid);
    await claimContract.createUnlockedCampaign(thirdId, campaign, BigInt(params.totalRecipients));
    let proof = getProof('./test/trees/tree.json', b.address);
    let delegatee = b.address;
    let expiry = BigInt(await time.latest()) + BigInt(60 * 60 * 24 * 7);
    let nonce = 0;
    const delegationValues = {
      delegatee,
      nonce,
      expiry,
    };
    const delegationSignature = await getSignature(b, tokenDomain, C.delegationtype, delegationValues);
    const delegationSig = {
      nonce,
      expiry,
      v: delegationSignature.v,
      r: delegationSignature.r,
      s: delegationSignature.s,
    };
    const bytes = ethers.encodeBytes32String('blank');
    const blankSig = {
      nonce: 0,
      expiry: 0,
      v: 0,
      r: bytes,
      s: bytes,
    };
    let tx = await claimContract
      .connect(b)
      .claimAndDelegateMultiple(
        [firstId, secondId, thirdId],
        [proof, proof, proof],
        [claimB, claimB, claimB],
        [delegatee, delegatee, delegatee],
        [delegationSig, blankSig, delegationSig],
        { value: feeAmount }
      );
    let votingVault = await lockup.votingVaults(2);
    expect(await token.delegates(votingVault)).to.eq(b.address);
    expect(await token.delegates(b.address)).to.eq(b.address);
  });
  it('DAO creates a vesting campaign and user is able to claim from three campaigns', async () => {
    campaign.tokenLockup = 2;
    uuid = uuidv4();
    fourthId = uuidParse(uuid);
    claimLockup = {
      tokenLocker: vesting.target,
      start: start,
      cliff: start,
      period: BigInt(1),
      periods: BigInt(1000),
    };
    await claimContract.createLockedCampaign(
      fourthId,
      campaign,
      claimLockup,
      dao.address,
      BigInt(params.totalRecipients)
    );
    let proof = getProof('./test/trees/tree.json', c.address);
    let delegatee = c.address;
    let expiry = BigInt(await time.latest()) + BigInt(60 * 60 * 24 * 7);
    let nonce = 0;
    const delegationValues = {
      delegatee,
      nonce,
      expiry,
    };
    const delegationSignature = await getSignature(c, tokenDomain, C.delegationtype, delegationValues);
    const delegationSig = {
      nonce,
      expiry,
      v: delegationSignature.v,
      r: delegationSignature.r,
      s: delegationSignature.s,
    };
    let tx = await claimContract
      .connect(c)
      .claimAndDelegateMultiple(
        [firstId, secondId, thirdId, fourthId],
        [proof, proof, proof, proof],
        [claimC, claimC, claimC, claimC],
        [delegatee, delegatee, delegatee, b.address],
        [delegationSig, delegationSig, delegationSig, delegationSig]
      );
    let votingVault = await lockup.votingVaults(3);
    let vestingVault = await vesting.votingVaults(1);
    expect(await token.delegates(votingVault)).to.eq(c.address);
    expect(await token.delegates(vestingVault)).to.eq(b.address);
    expect(await token.delegates(c.address)).to.eq(c.address);
  });
  it('User cannot claim without delegating properly', async () => {
    let proof = getProof('./test/trees/tree.json', d.address);
    const bytes = ethers.encodeBytes32String('blank');
    const blankSig = {
      nonce: 0,
      expiry: 0,
      v: 0,
      r: bytes,
      s: bytes,
    };
    let delegatee = d.address;
    let expiry = BigInt(await time.latest()) + BigInt(60 * 60 * 24 * 7);
    let nonce = 0;
    const delegationValues = {
      delegatee,
      nonce,
      expiry,
    };
    const delegationSignature = await getSignature(d, tokenDomain, C.delegationtype, delegationValues);
    const delegationSig = {
      nonce,
      expiry,
      v: delegationSignature.v,
      r: delegationSignature.r,
      s: delegationSignature.s,
    };
    await expect(
      claimContract
        .connect(d)
        .claimAndDelegateMultiple(
          [firstId, secondId],
          [proof, proof],
          [claimD, claimD],
          [d.address, d.address],
          [blankSig, blankSig]
        )
    ).to.be.reverted;
    await expect(
      claimContract
        .connect(d)
        .claimAndDelegateMultiple(
          [firstId, secondId],
          [proof, proof],
          [claimD, claimD],
          [C.ZERO_ADDRESS, d.address],
          [delegationSig, delegationSig]
        )
    ).to.be.revertedWith('0_delegatee');
    await expect(
      claimContract
        .connect(d)
        .claimAndDelegateMultiple(
          [firstId, secondId],
          [proof, proof],
          [claimD, claimD],
          [delegatee, C.ZERO_ADDRESS],
          [delegationSig, delegationSig]
        )
    ).to.be.revertedWith('0_delegatee');
    await expect(
      claimContract
        .connect(d)
        .claimAndDelegateMultiple(
          [firstId, secondId],
          [proof, proof],
          [claimD, claimD],
          [c.address, delegatee],
          [delegationSig, delegationSig]
        )
    ).to.be.revertedWith('delegation failed');
  });
  it('User cannot claim from claims they have already claimed from', async () => {
    let proof = getProof('./test/trees/tree.json', a.address);
    let delegatee = a.address;
    let expiry = BigInt(await time.latest()) + BigInt(60 * 60 * 24 * 7);
    let nonce = 0;
    const delegationValues = {
      delegatee,
      nonce,
      expiry,
    };
    const delegationSignature = await getSignature(a, tokenDomain, C.delegationtype, delegationValues);

    const delegationSig = {
      nonce,
      expiry,
      v: delegationSignature.v,
      r: delegationSignature.r,
      s: delegationSignature.s,
    };
    await expect(
      claimContract
        .connect(a)
        .claimAndDelegateMultiple(
          [firstId, secondId],
          [proof, proof],
          [claimA, claimA],
          [delegatee, b.address],
          [delegationSig, delegationSig]
        )
    ).to.be.revertedWith('already claimed');
    await expect(
      claimContract
        .connect(a)
        .claimAndDelegateMultiple(
          [firstId, thirdId],
          [proof, proof],
          [claimA, claimA],
          [delegatee, delegatee],
          [delegationSig, delegationSig]
        )
    ).to.be.revertedWith('already claimed');
  });
};

module.exports = {
  multiClaimDelegateTests,
};
