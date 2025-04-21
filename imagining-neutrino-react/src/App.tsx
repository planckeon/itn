import TopControlBar from "./components/TopControlBar";
import VisualizationArea from "./components/VisualizationArea";
import BottomPlotContainer from "./components/BottomPlotContainer";
import { StateProvider } from "./state";
import "./index.css";

function App() {
  return (
    <StateProvider>
      <div className="relative min-h-screen flex flex-col bg-neutral-950 text-neutral-100 overflow-hidden">
        <TopControlBar />
        <main className="flex-1 flex flex-col justify-center items-center px-4 pt-20 pb-20">
          <VisualizationArea />
        </main>
        <BottomPlotContainer />
      </div>
    </StateProvider>
  );
}

export default App;
