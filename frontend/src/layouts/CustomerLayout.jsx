import { Outlet } from 'react-router-dom';

export default function CustomerLayout() {
  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans">
      <Outlet />
    </div>
  );
}
