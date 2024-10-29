const  { parseAbiItem, createPublicClient, http, formatUnits } =  require('viem')
const { mainnet, sepolia } = require('viem/chains')
const abi = require('./abi.json')
const fs = require('fs');
const { format } = require('fast-csv');




const publicClient = createPublicClient({
    chain: mainnet,
    transport: http('https://eth-mainnet.g.alchemy.com/v2/9WJbt3XOcSzhJf-XXudD4KyW9DSNdomO')
})

const contractAddress = '0xe54a7e5615Ac3236E415Fd9Fead420adeACb92eA';

const getLogs = async (blockfrom, blockto) => {
    const logs = await publicClient.getContractEvents({ 
        address: contractAddress,
        abi: abi,
        eventName: 'Claimed',
        fromBlock: 20952799n,
        toBlock: 21070119n,
    })
    
    if(logs.length > 0) {
        const ws = fs.createWriteStream('./data/claims.csv');

        const csvStream = format({ headers: true })   // Create a single CSV stream
        .on('error', (err) => console.error('Error during CSV write:', err))
        .on('finish', () => console.log(`file created successfully.`));  // Log when done

        // Pipe the CSV stream to the writable stream
        csvStream.pipe(ws);
        logs.map(log => {
            csvStream.write({user: log.args.user, amount: formatUnits(log.args.amount, 18), blockNumber: log.blockNumber, timeStamp: new Date(Number(log.args.timestamp.toString()) * 1000).toISOString() });
        })

        csvStream.end();

    }
}

let blockStart = BigInt(20952799)

do {
    getLogs(blockStart, blockStart+BigInt(800))
    blockStart += BigInt(800) 
} while (blockStart >= BigInt(21070119))