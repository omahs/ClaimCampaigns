const C = require('../constants');
const { getSignature } = require('../helpers');
const setup = require('../fixtures');
const { expect } = require('chai');
const { time } = require('@nomicfoundation/hardhat-network-helpers');
const { createTree, getProof } = require('../merkleGenerator');
const { ethers } = require('hardhat');
const { v4: uuidv4, parse: uuidParse } = require('uuid');

const treasuryTests = (params) => {
  let deployed, dao, a, b, c, d, e, token, claimContract, tokenDomain, claimDomain;
  let amount, campaign, claimA, claimB, claimC, claimD, claimE, id, treasury, feeAmount;
  it('Deploys contracts and DAO Creates a claim', async () => {
    deployed = await setup(params.decimals);
    dao = deployed.dao;
    a = deployed.a;
    b = deployed.b;
    c = deployed.c;
    d = deployed.d;
    e = deployed.e;
    treasury = deployed.treasury;
    feeAmount = BigInt(7) * BigInt(10 ** 15);
    token = deployed.nvToken;
    tokenDomain = deployed.tokenDomain;
    claimDomain = deployed.claimDomain;
    claimContract = deployed.claimContract;
    lockup = deployed.lockup;
    await token.approve(claimContract.target, BigInt(10 ** params.decimals) * BigInt(1000000));
    let treevalues = [];
    amount = BigInt(0);
    const uuid = uuidv4();
    id = uuidParse(uuid);
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
    const root = createTree(treevalues, ['address', 'uint256']);
    let now = BigInt(await time.latest());
    let start = now;
    let end = BigInt(60 * 60 * 24 * 7) + now;
    campaign = {
      manager: dao.address,
      token: token.target,
      amount,
      start,
      end,
      tokenLockup: 0,
      root,
      delegating: false,
    };
    let treasuryBalance = BigInt(await ethers.provider.getBalance(treasury.address));
    await expect(
      claimContract.createUnlockedCampaign(id, campaign, BigInt(treevalues.length), { value: feeAmount })
    ).to.emit(claimContract, 'CampaignStarted');
    expect(await token.balanceOf(claimContract.target)).to.eq(amount);
    expect(await claimContract.usedIds(id)).to.eq(true);
    expect(await ethers.provider.getBalance(claimContract.target)).to.eq(0);
    let paidTreasury = BigInt(await ethers.provider.getBalance(treasury.address));
    expect(paidTreasury).to.eq(treasuryBalance + feeAmount);
  });
  it('treasury changes wallet address and then the claim fees are paid to new wallet', async () => {
    await expect(claimContract.changeTreasury(e.address)).to.be.revertedWith('only treasury');
    await claimContract.connect(treasury).changeTreasury(e.address);
    await expect(claimContract.connect(treasury).changeTreasury(e.address)).to.be.revertedWith('only treasury');
    let proof = getProof('./test/trees/tree.json', a.address);
    let treasuryBalance = BigInt(await ethers.provider.getBalance(e.address));
    let tx = await claimContract.connect(a).claim(id, proof, claimA, { value: feeAmount });
    expect(tx).to.emit(token, 'Transfer').withArgs(claimContract.target, a.address, claimA);
    expect(tx)
      .to.emit(claimContract, 'UnlockedTokensClaimed')
      .withArgs(id, a.address, claimA, amount - claimA);
    expect(await token.balanceOf(a.address)).to.eq(claimA);
    expect(await token.balanceOf(claimContract.target)).to.eq(amount - claimA);
    expect(await claimContract.claimed(id, a.address)).to.eq(true);
    expect(await ethers.provider.getBalance(claimContract.target)).to.eq(0);
    let paidTreasury = BigInt(await ethers.provider.getBalance(e.address));
    expect(paidTreasury).to.eq(treasuryBalance + feeAmount);
    await claimContract.connect(e).changeTreasury(treasury.address);
  });
  it('treasury can remove or add locker addresses to whitelist', async () => {
    await claimContract.connect(treasury).updateLocker(lockup.target, false);
    expect(await claimContract.tokenLockers(lockup.target)).to.eq(false);
    await expect(claimContract.connect(a).updateLocker(lockup.target, true)).to.be.revertedWith('only treasury');
    let now = BigInt(await time.latest());
    start = now;
    cliff = start;
    period = BigInt(1);
    periods = BigInt(60*60*24);
    end = start + periods;
    let treevalues = [];
    amount = BigInt(0);
    const uuid = uuidv4();
    id = uuidParse(uuid);
    for (let i = 0; i < params.totalRecipients; i++) {
      let wallet;
      let amt = C.randomBigNum(1000, 100, params.decimals);
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
    remainder = amount;
    const root = createTree(treevalues, ['address', 'uint256']);
    campaign = {
      manager: dao.address,
      token: token.target,
      amount,
      start: now,
      end: BigInt((await time.latest()) + 60 * 60),
      tokenLockup: 1,
      root,
      delegating: false,
    };
    claimLockup = {
      tokenLocker: lockup.target,
      start,
      cliff,
      period,
      periods,
    };
    await expect(
      claimContract.createLockedCampaign(id, campaign, claimLockup, C.ZERO_ADDRESS, BigInt(treevalues.length), {
        value: feeAmount,
      })
    ).to.be.revertedWith('invalid locker');
    await claimContract.connect(treasury).updateLocker(lockup.target, true);
    expect(await claimContract.tokenLockers(lockup.target)).to.eq(true);
    let treasuryBalance = BigInt(await ethers.provider.getBalance(treasury.address));
    const tx = await claimContract.createLockedCampaign(
        id,
        campaign,
        claimLockup,
        C.ZERO_ADDRESS,
        BigInt(treevalues.length),
        {value: feeAmount}
      );
      expect(tx).to.emit(claimContract, 'ClaimLockupCreated').withArgs(id, claimLockup);
      expect(tx).to.emit(claimContract, 'CampaignCreated').withArgs(id, campaign, BigInt(treevalues.length));
      expect(tx).to.emit(token, 'Transfer').withArgs(dao.target, claimContract.target, amount);
      expect(tx).to.emit(token, 'Approval').withArgs(claimContract.target, lockup.target, amount);
      expect(await ethers.provider.getBalance(claimContract.target)).to.eq(0);
      let paidTreasury = BigInt(await ethers.provider.getBalance(treasury.address));
      expect(paidTreasury).to.eq(treasuryBalance + feeAmount);
  });
};


module.exports = {
    treasuryTests,
}