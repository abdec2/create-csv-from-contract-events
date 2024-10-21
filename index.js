const  { parseAbiItem, createPublicClient, http, formatUnits } =  require('viem')
const { mainnet, sepolia } = require('viem/chains')
const abi = require('./abi.json')
const fs = require('fs');
const { format } = require('fast-csv');




const publicClient = createPublicClient({
    chain: mainnet,
    transport: http()
})

const contractAddress = '0xe54a7e5615Ac3236E415Fd9Fead420adeACb92eA';

const getLogs = async () => {
    const logs = await publicClient.getContractEvents({ 
        address: contractAddress,
        abi: abi,
        eventName: 'Claimed',
        fromBlock: 20952799n,
    })
    
    if(logs.length > 0) {
        const ws = fs.createWriteStream('./data/claims.csv');

        const csvStream = format({ headers: true })   // Create a single CSV stream
        .on('error', (err) => console.error('Error during CSV write:', err))
        .on('finish', () => console.log(`file created successfully.`));  // Log when done

        // Pipe the CSV stream to the writable stream
        csvStream.pipe(ws);
        logs.map(log => {
            csvStream.write({user: log.args.user, amount: formatUnits(log.args.amount, 18), timeStamp: log.args.timestamp});
        })

        csvStream.end();

    }
}

getLogs()