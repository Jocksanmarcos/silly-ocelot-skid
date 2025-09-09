import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 bg-muted/40">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;