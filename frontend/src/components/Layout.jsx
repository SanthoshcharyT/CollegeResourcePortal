import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />

            <div className="flex flex-1 max-w-8xl w-full mx-auto">
                {/* Sidebar (Only visible if logged in and on large screens) */}
                {user && <Sidebar />}

                <main className="flex-1 flex flex-col w-full min-w-0">
                    <div className="flex-1 p-6 lg:p-8">
                        {children}
                    </div>
                    {/* Footer inside main content area if sidebar is present, or strictly at bottom? 
                        Typically footer goes at bottom of main content part.
                    */}
                    <div className="mt-auto">
                        <Footer />
                        {/* Note: Footer was previously full width. 
                             If sidebar is there, footer should be to the right of sidebar. 
                             Placing it here achieves that.
                         */}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
