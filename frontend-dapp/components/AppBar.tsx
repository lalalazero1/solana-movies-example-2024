import { FC } from 'react'
import dynamic from 'next/dynamic'
import styles from '../styles/Home.module.css'
import Image from 'next/image'

const WalletButton = dynamic(async () => {
    const { WalletMultiButton } = await import("@solana/wallet-adapter-react-ui")
    return WalletMultiButton
}, {
    ssr: false
})

export const AppBar: FC = () => {
    return (
        <div className={styles.AppHeader}>
            <Image src="/solanaLogo.png" height={30} width={200} />
            <span>Movie Reviews</span>
            <WalletButton />
        </div>
    )
}