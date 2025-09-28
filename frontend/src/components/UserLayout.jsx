// components/UserLayout.jsx
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import { Outlet } from 'react-router-dom';

export default function UserLayout({ onCartClick, totalItems }) {
    return (
        <>
            <Header onCartClick={onCartClick} totalItems={totalItems} />
            <main className="min-h-screen">
                <Outlet />
            </main>
            <Footer />
        </>
    );
}
