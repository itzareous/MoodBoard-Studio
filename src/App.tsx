import { ThemeProvider } from '@/context/ThemeContext';
import { BoardProvider } from '@/context/BoardContext';
import MainLayout from '@/components/Layout/MainLayout';

function App() {
  return (
    <ThemeProvider>
      <BoardProvider>
        <MainLayout />
      </BoardProvider>
    </ThemeProvider>
  );
}

export default App;