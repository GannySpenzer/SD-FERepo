import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom"
import TaskGrid from "./Components/TaskGrid/TaskGrid.tsx";
import InventoryScreen from "./Components/InventoryScreen/InventoryScreen";
import Login from "./Components/Login/Login";
import React from "react";
import SourceConnector from "./Components/SourceConnectorScreen/SourceConnector";
import TargetConnector from "./Components/TargetConnectorScreen/TargetConnector";
import MigrationScreen from "./Components/MigrationScreen/MigrationScreen";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/task" element={<TaskGrid />} />
        <Route path="/inventoryScreen" element={<InventoryScreen />} />
        <Route path="/login" element={<Login />} />
        <Route path="/source" element={<SourceConnector />} />
        <Route path="/target" element={<TargetConnector />} />
        <Route path="/migrationScreen" element={<MigrationScreen />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
