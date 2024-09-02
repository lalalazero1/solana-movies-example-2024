import * as web3 from '@solana/web3.js'
import * as borsh from '@project-serum/borsh'
import * as fs from 'fs'
import dotenv from 'dotenv'
dotenv.config()

const PROGRAM_ID = "FEQmfwU5qzBU9otZTJDynvkndwDqNDyUMFn7vF4jrQ76"

function initializeSignerKeypair(): web3.Keypair {
    if (!process.env.PRIVATE_KEY) {
        console.log('Creating .env file')
        const signer = web3.Keypair.generate()
        fs.writeFileSync('.env', `PRIVATE_KEY=[${signer.secretKey.toString()}]`)
        return signer
    }

    const secret = JSON.parse(process.env.PRIVATE_KEY ?? "") as number[]
    const secretKey = Uint8Array.from(secret)
    const keypairFromSecretKey = web3.Keypair.fromSecretKey(secretKey)
    return keypairFromSecretKey
}

async function airdropSolIfNeeded(signer: web3.Keypair, connection: web3.Connection) {
    const balance = await connection.getBalance(signer.publicKey)
    console.log('Current balance is', balance)
    if (balance < web3.LAMPORTS_PER_SOL) {
        console.log('Airdropping 1 SOL...')
        await connection.requestAirdrop(signer.publicKey, web3.LAMPORTS_PER_SOL)
    }
}

const movieInstructionLayout = borsh.struct([
    borsh.u8('variant'),
    borsh.str('title'),
    borsh.u8('rating'),
    borsh.str('description')
])

async function sendTestMovieReview(signer: web3.Keypair, programId: web3.PublicKey, connection: web3.Connection) {
    let buffer = Buffer.alloc(1000)
    const random = Math.random()*10
    const randomString = random.toFixed(2)
    const movieTitle = `Braveheart-random-${randomString}`
    // const movieTitle = "Test Hero 1222"
    const variant = 0
    movieInstructionLayout.encode(
        {
            variant,
            title: movieTitle,
            rating: 5,
            description: `test description - variant ${variant}`
        },
        buffer
    )

    buffer = buffer.subarray(0, movieInstructionLayout.getSpan(buffer))

    const [pda] = web3.PublicKey.findProgramAddressSync(
        // 用户地址 + movieTitle 作为种子，相同的种子会推导出同一个 pda 地址，也就是数据账户
        [signer.publicKey.toBuffer(), Buffer.from(movieTitle)],
        programId
    )

    console.log("PDA is:", pda.toBase58())

    const transaction = new web3.Transaction()

    const instruction = new web3.TransactionInstruction({
        programId: programId,
        data: buffer,
        keys: [
            {
                pubkey: signer.publicKey,
                isSigner: true,
                isWritable: false
            },
            {
                pubkey: pda,
                isSigner: false,
                isWritable: true
            },
            {
                pubkey: web3.SystemProgram.programId,
                isSigner: false,
                isWritable: false
            }
        ]
    })

    transaction.add(instruction)
    try {
        const tx = await web3.sendAndConfirmTransaction(connection, transaction, [signer])
        console.log(`txHash=${tx}`)
    } catch (e) {
        console.log(e)
    }
    // console.log(`https://explorer.solana.com/tx/${tx}?cluster=devnet`)
}

async function main() {
    const signer = initializeSignerKeypair()
    console.log('publicKey=', signer.publicKey.toString())

    // const connection = new web3.Connection(web3.clusterApiUrl('devnet'))
    const connection = new web3.Connection('http://localhost:8899')
    await airdropSolIfNeeded(signer, connection)

    const movieProgramId = new web3.PublicKey(PROGRAM_ID)
    await sendTestMovieReview(signer, movieProgramId, connection)
}

main().then(() => {
    console.log('Finished successfully')
    process.exit(0)
}).catch(error => {
    console.log(error)
    process.exit(1)
})