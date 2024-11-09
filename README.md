# Claim Campaigns

Claim Campaigns are a contract using merkle trees to create a efficient way to distribute token claims to any number of wallet addreses. The contract is optimized to not only give the ability for users to claim unlocked tokens, but also taps into the Hedgey Vesting and Hedgey Lockup contracts that bake in and automate vesting or token lockup schedules. The contract can be used to distribute tokens where users have to delegate tokens when they claim them, or optionally without delegating, but the creator can define if delegation is required. 

The intent is that for some DAOs, they require an initial amount of token delegations to meet quorum, and this contract is designed to help DAOs launching their token claims / airdrops where users have to delegate such that the quorum will always be met once users have claimed and delegated their tokens. 

## Testing

Clone repistory

``` bash
npm install
npx hardhat compile
npx hardhat test
```

## Deployment
To deploy the ClaimCampaigns contract create a .env file in the main directory with your private key(s), network RPCs and etherscan API keys. Use the scripts/deploy.js file to deploy the contract, you can use hardhat to deploy and verify the contract using the command: 

``` bash
npx hardhat run scripts/deploy.js --network <network-name>
```

## Testnet Deployments   
   
- Holesky: `0x8A2725a6f04816A5274dDD9FEaDd3bd0C253C1A6`  
- Sepolia: `0x8A2725a6f04816A5274dDD9FEaDd3bd0C253C1A6`  


## Mainnet Deployments   
     
- Ethereum Mainnet: `0x8A2725a6f04816A5274dDD9FEaDd3bd0C253C1A6`  
- Arbiturm One: `0x8A2725a6f04816A5274dDD9FEaDd3bd0C253C1A6`  
- Polygon: `0x8A2725a6f04816A5274dDD9FEaDd3bd0C253C1A6`  
- BNB Smart Chain: `0x8A2725a6f04816A5274dDD9FEaDd3bd0C253C1A6`  
- Optimism: `0x8A2725a6f04816A5274dDD9FEaDd3bd0C253C1A6`  
- BASE: `0x8A2725a6f04816A5274dDD9FEaDd3bd0C253C1A6`  
- Linea-mainnet: `0x8A2725a6f04816A5274dDD9FEaDd3bd0C253C1A6`  
- Mode Network: `0x8A2725a6f04816A5274dDD9FEaDd3bd0C253C1A6`  
- Zora: `0x8A2725a6f04816A5274dDD9FEaDd3bd0C253C1A6`  
- IOTA EVM: `0x8A2725a6f04816A5274dDD9FEaDd3bd0C253C1A6`  
- Mantle Network: `0x8A2725a6f04816A5274dDD9FEaDd3bd0C253C1A6`  
- Celo: `0x8A2725a6f04816A5274dDD9FEaDd3bd0C253C1A6`  
- Scroll: `0x8A2725a6f04816A5274dDD9FEaDd3bd0C253C1A6`  
- Avalanche: `0x8A2725a6f04816A5274dDD9FEaDd3bd0C253C1A6`  
- Gnosis: `0x8A2725a6f04816A5274dDD9FEaDd3bd0C253C1A6`  
- Blast: `0x8A2725a6f04816A5274dDD9FEaDd3bd0C253C1A6`  


