import "./App.css";
import { useState } from "react";
import { VgButton } from "vg/react";

function App() {
  const [textSize, setTextSize] = useState("md");
  return (
    <div className="App">
      <VgButton size={textSize} onTick={(e) => console.log(e)}>
        Test
      </VgButton>
      <br />
      <VgButton></VgButton>

      <br />
      <select onChange={(e) => setTextSize(e.target.value)}>
        <option value="lg" selected={textSize == "lg"}>
          lg
        </option>
        <option value="md" selected={textSize == "md"}>
          md
        </option>
        <option value="sm" selected={textSize == "sm"}>
          sm
        </option>
      </select>
    </div>
  );
}

export default App;
