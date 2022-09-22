import Home from "@/components/layouts/Home";
import Profile from "@/components/layouts/Profile";

const publicRoutes = [
    {path: '/', component: Home},
    {path: '/profile', component: Profile},
];

const privateRoutes = [

];

export {publicRoutes, privateRoutes};