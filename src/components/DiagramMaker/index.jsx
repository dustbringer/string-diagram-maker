import React from "react";
import { styled } from "@mui/system";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import FixedSVG from "../FixedSVG";
import Node from "./Node";
import Line from "./Line";
import NodeButton from "./NodeButton";

import { ssSvg, ssDisp, getSvgInfo } from "./position";

// Position relative to hold children with position absolute
const RelativeDiv = styled("div")`
  position: relative;
  margin: 10px 0;
  ${(props) => props.width && `width: ${props.width}px;`}
  ${(props) => props.height && `height: ${props.height}px;`}
`;

// Border around svg and shift to center node buttons
const SVG = styled(FixedSVG)`
  border: 3px solid lightgrey;
  border-radius: 5px;
  top: -3px;
  left: -3px;
`;

// Dot helper
const toggleDot = (d, x, y) => {
  const found = d.findIndex((e) => e.x === x && e.y === y);

  // Add occurence
  if (found < 0) return [...d, { x, y }];

  // Remove occurence
  const ret = [...d];
  ret.splice(found, 1);
  return ret;
};

// Line helper
const sameLine = (l1, l2) =>
  (l1.x1 === l2.x1 && l1.y1 === l2.y1 && l1.x2 === l2.x2 && l1.y2 === l2.y2) ||
  (l1.x1 === l2.x2 && l1.y1 === l2.y2 && l1.x2 === l2.x1 && l1.y2 === l2.y1);
const addLine = (l, x1, y1, x2, y2) => [...l, { x1, y1, x2, y2 }];
const removeLine = (l, x1, y1, x2, y2) =>
  l.filter((e) => !sameLine(e, { x1, y1, x2, y2 }));

function DiagramMaker({
  width = 5,
  height = 5,
  dispScale = 120,
  mode = "line",
  showMode,
  onChange,
}) {
  const [selected, setSelected] = React.useState(null);
  const [dots, setDots] = React.useState([]);
  const [lines, setLines] = React.useState([]);

  const svgInfo = getSvgInfo(width, height, dispScale);

  const clickNode = (x, y) => {
    if (mode === "dot") {
      setDots((d) => toggleDot(d, x, y));
      setSelected(null);
    } else if (mode === "line") {
      if (selected) {
        if (selected.x !== x || selected.y !== y)
          setLines((l) => addLine(l, selected.x, selected.y, x, y));
        setSelected(null);
      } else {
        setSelected({ x, y });
      }
    }
  };

  React.useEffect(() => {
    onChange(dots, lines);
  }, [dots, lines, onChange]);

  return (
    <div>
      {showMode && `Mode: ${mode}`}
      <RelativeDiv width={width * dispScale} height={height * dispScale}>
        <SVG
          width={`${svgInfo.width}px`}
          height={`${svgInfo.height}px`}
          viewBox={`0 0 ${svgInfo.vieww} ${svgInfo.viewh}`}
        >
          {/* Grey dots */}
          {[...Array(height)].map((_, y) => (
            <React.Fragment key={`Fragment ${y}`}>
              {[...Array(width)].map((_, x) => (
                <Node
                  key={`Node ${x} ${y}`}
                  cx={svgInfo.posSvg(x)}
                  cy={svgInfo.posSvg(y)}
                />
              ))}
            </React.Fragment>
          ))}

          {/* Lines */}
          {lines.map((l, i) => (
            <Line
              key={`Line ${i}`}
              x1={`${svgInfo.posSvg(l.x1)}`}
              y1={`${svgInfo.posSvg(l.y1)}`}
              x2={`${svgInfo.posSvg(l.x2)}`}
              y2={`${svgInfo.posSvg(l.y2)}`}
              stroke="red"
              strokeWidth={6}
              strokeLinecap="round"
              onClick={() =>
                setLines((_l) => removeLine(_l, l.x1, l.y1, l.x2, l.y2))
              }
            />
          ))}

          {/* Dots */}
          {Object.keys(dots).map((d, i) => (
            <circle
              key={`Dot ${i}`}
              cx={svgInfo.posSvg(dots[d].x)}
              cy={svgInfo.posSvg(dots[d].y)}
              fill="red"
              r={12}
            />
          ))}
        </SVG>

        {/* Dot buttons */}
        {[...Array(height)].map((_, y) => (
          <React.Fragment key={`Fragment ${y}`}>
            {[...Array(width)].map((_, x) => (
              <NodeButton
                key={`Node ${x} ${y}`}
                radius={dispScale / 5}
                left={svgInfo.posDisp(x)}
                top={svgInfo.posDisp(y)}
                onClick={(e) => clickNode(x, y)}
                selected={selected && selected.x === x && selected.y === y}
              />
            ))}
          </React.Fragment>
        ))}
      </RelativeDiv>

      <Button
        variant="outlined"
        size="small"
        disableElevation
        onClick={() => {
          setLines([]);
          setDots([]);
        }}
        sx={{ marginBottom: "5px" }}
      >
        Reset
      </Button>
    </div>
  );
}

export default DiagramMaker;
