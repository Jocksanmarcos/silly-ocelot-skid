import { Outlet } from "react-router-dom";
import LeaderHeader from "./LeaderHeader";

const LeaderLayout = () => {
  return (
    <div className="relative flex min-h-screen flex-col">
      <LeaderHeader />
      <div className="flex-1">
        <main className="container py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LeaderLayout;