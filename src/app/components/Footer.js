import Link from 'next/link'
import '../styles/footer.scss'

export default function Footer() {
    return (
        <div className="footer_ flex-row justify-between align-center">
            <Link href={'/'}>
                <img
                    className="image_18"
                    src={"/images/logo_white.png"}
                />
            </Link>
            {/* <Link href={'https://docs.google.com/document/d/19nKm4ZPkiq56Fvqv5RYOlDCsEVGte41kd838IEOa7H8/edit?usp=sharing'} className="text_75">Pricacy</Link>
            <Link href={'https://docs.google.com/document/d/1Brc4RdM87qH9jVAPPvdBwQUouuabg7Mci2jd3XzrRBs/edit?usp=sharing'} className="text_76">Terms</Link>
            <span className="text_77">Copyright</span> */}

            <div className="flex-row">
                <Link target='ta' href={'https://x.com/AppBaseOfficial'}>
                    <img
                        className="image_19"
                        src={"/images/x.svg"}
                    />
                </Link>

                <Link target='ta' href={'https://t.me/AppBaseOfficial'}>
                    <img
                        className="image_19"
                        src={"/images/telegram_icon.svg"}
                    />
                </Link>
            </div>

        </div>
    )
}