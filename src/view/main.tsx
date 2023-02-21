import React from "react";
import ReactDOM from "react-dom/client";
import { Stage, Layer, Circle } from "react-konva";
import "./contentscript.css";

const MainApp = () => {
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Circle x={10} y={10} radius={5} fill="green" />
      </Layer>
    </Stage>
  );
};

export const render = () => {
  // const divElement = document.createElement("div");
  // divElement.id = "root";
  // divElement.className = "beh_container";
  // document.body.append(divElement);
  // const root = ReactDOM.createRoot(
  //   document.getElementById("root") as HTMLElement
  // );
  // root.render(
  //   <React.StrictMode>
  //     <MainApp />
  //   </React.StrictMode>
  // );
};
