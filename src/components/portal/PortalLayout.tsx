import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

const PortalLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default PortalLayout;