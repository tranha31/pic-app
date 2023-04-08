import Home from "../components/layouts/Home";
import Login from "../components/layouts/Login";

const publicRoutes = [
    {path: '/', component: Home},
    {path: '/appeal_request', component: Home},
    {path: '/login', component: Login}
];

const homeRoutes = [
    {path: '/', name: 'Signature'},
    {path: '/appeal_request', name: 'AppealRequest'}
];

export {publicRoutes, homeRoutes}