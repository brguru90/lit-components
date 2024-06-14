import './App.css';
import {VgButton} from "vg/react"


function App() {
  return (
    <div className="App">

     <VgButton size='lg' onTick={e=>console.log(e)}>Test</VgButton>
     <br />
     <VgButton></VgButton>
    </div>
  );
}

export default App;
