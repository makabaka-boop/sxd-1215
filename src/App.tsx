import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainMenu from "@/pages/MainMenu";
import LevelSelect from "@/pages/LevelSelect";
import Tutorial from "@/pages/Tutorial";
import GameBoard from "@/pages/GameBoard";
import ResultPage from "@/pages/ResultPage";
import HighScores from "@/pages/HighScores";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/levels" element={<LevelSelect />} />
        <Route path="/tutorial" element={<Tutorial />} />
        <Route path="/game/:levelId" element={<GameBoard />} />
        <Route path="/result/:levelId" element={<ResultPage />} />
        <Route path="/highscores" element={<HighScores />} />
        <Route path="*" element={<MainMenu />} />
      </Routes>
    </Router>
  );
}
