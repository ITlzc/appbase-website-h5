import '../styles/header.scss'
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Header() {
   


    return (
        <div className="header_ flex-row align-center justify-between">
            <Link href={'/'} >
                <img
                    className="image_1"
                    src={"/images/logo.png"}
                />
            </Link>

            <Link href={'/searchApps'} >
                <img
                    className="image_2"
                    src={"/images/menu-h5.png"}
                />
            </Link>

        </div>
    )
}