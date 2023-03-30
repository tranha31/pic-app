import Home from "@/components/layouts/Home";
import Profile from "@/components/layouts/Profile";
import Auction from "@/components/layouts/Auction";

const publicRoutes = [
    {path: '/', component: Home},
    {path: '/my_collection', component: Profile},
    {path: '/auction', component: Auction},
    {path: '/sell', component: Home},
];

const privateRoutes = [

];

const headerRoutes = [
    {path: '/', name: 'Home'},
    {path: '/auction', name: 'Auction'},
    {path: '/my_collection', name: 'My Collection'},
]

const homeRoutes = [
    {path: '/', name: 'Collection'},
    {path: '/sell', name: 'Sell'},
]

export {publicRoutes, privateRoutes, headerRoutes, homeRoutes};