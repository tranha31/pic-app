import Home from "@/components/layouts/Home";
import Profile from "@/components/layouts/Profile";
import Auction from "@/components/layouts/Auction";

const publicRoutes = [
    {path: '/', component: Home},
    {path: '/profile', component: Profile},
    {path: '/auction', component: Auction},
];

const privateRoutes = [

];

const headerRoutes = [
    {path: '/', name: 'Home'},
    {path: '/auction', name: 'Auction'},
]

export {publicRoutes, privateRoutes, headerRoutes};