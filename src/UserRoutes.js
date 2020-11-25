import Dashboard from "./views/Dashboard.js";
import Notifications from "./views/Notifications.js";
import Icons from "./views/Icons.js";
import Typography from "./views/Typography.js";
import OrderList from "./views/OrderTable.js";
import Maps from "./views/Map.js";
import UserPage from "./views/UserProfile.js";
import UpgradeToPro from "./views/Upgrade.js";
import FillInfo from "./views/FillInfoPage.js";

var UserRoutes = [
  {
    path: "/user-page",
    name: "User Profile",
    icon: "nc-icon nc-single-02",
    component: UserPage,
    layout: "/user",
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "nc-icon nc-layout-11",
    component: Dashboard,
    layout: "/user",
  },
  {
    path: "/maps",
    name: "Maps",
    icon: "nc-icon nc-pin-3",
    component: Maps,
    layout: "/user",
  },
  {
    path: "/tables",
    name: "Order History",
    icon: "nc-icon nc-tile-56",
    component: OrderList,
    layout: "/user",
  },
];
export default UserRoutes;
