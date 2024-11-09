const { ethers, run } = require('hardhat');
const { setTimeout } = require('timers/promises');
const networkData = require('./networkData');

async function deploy(treasury, lockers) {
    const Claims = await ethers.getContractFactory('ClaimCampaigns');
    const claims = await (await Claims.deploy(treasury, 'ClaimCampaigns', '1', lockers)).waitForDeployment();
    // const claims = Claims.attach('0x8A2725a6f04816A5274dDD9FEaDd3bd0C253C1A6');
    console.log('Claims deployed to:', claims.target);
    await setTimeout(15000);
    await run('verify:verify', {
        address: claims.target,
        constructorArguments: [treasury, 'ClaimCampaigns', '1', lockers],
    });
}


async function deployContract() {
    const networkName = (await ethers.provider.getNetwork()).name;
    console.log(`networkName: ${networkName}`);
    const network = networkData[networkName];
    console.log(network);
    const treasury = network.treasury;
    const vesting = network.vesting;
    const votingVesting = network.votingVesting;
    const tokenLockup = network.tokenLockup;
    const votingLockup = network.votingLockup;
    const boundTokenLockups = network.boundTokenLockups;
    const boundVotingTokenLockups = network.boundVotingTokenLockups;
    const lockers = [vesting, votingVesting, tokenLockup, votingLockup, boundTokenLockups, boundVotingTokenLockups];
    if (network.check) {
        console.log('deploying contract');
        await deploy(treasury, lockers);
    } else {
        console.log('something went wrong');
    }
    
}

deployContract();