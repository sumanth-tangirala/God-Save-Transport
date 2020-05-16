import React from 'react';
import styles from '../styles/App.module.css';
import MapContainer from "./MapContainer";
import Controls from "./Controls";

function App() {
  return (
    <div className={styles.App}>
      <MapContainer/>
      <Controls/>
    </div>
  );
}

export default App;
