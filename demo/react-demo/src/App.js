import './App.css';
import {VgButton} from "vg/dist/react/"


function App() {
  return (
    <div className="App">

     <VgButton size='sm' onTick={e=>console.log(e)}>Test</VgButton>
     <br />
     <VgButton></VgButton>
    </div>
  );
}

export default App;
