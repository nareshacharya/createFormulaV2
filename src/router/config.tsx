import type { RouteObject } from "react-router-dom";
import Home from "../pages/home/page";
import NotFound from "../pages/NotFound";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
