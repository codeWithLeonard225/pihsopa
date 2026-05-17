import Navbar from "../components/Navbar";

export const metadata = {
    title: "Providence International High School Old Pupils Association (PIHSOPA)",
    description: "Uniting Providence International High School alumni to promote development, support education, and strengthen community impact.",
};

export default function MainLayout({ children }) {
    return (
        <div>
            <Navbar />
            {children}
        </div>
    );
}