import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Canvas from './Canvas';

export default function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        <TopBar />
        <Canvas />
      </div>
    </div>
  );
}
