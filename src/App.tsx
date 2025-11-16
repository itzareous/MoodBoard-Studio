import { BoardProvider } from '@/context/BoardContext';
import MainLayout from '@/components/Layout/MainLayout';

function App() {
  return (
    <BoardProvider>
      <MainLayout />
    </BoardProvider>
  );
}

export default App;