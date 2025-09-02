"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { WhiteboardState, WhiteboardAction } from "@/lib/types/whiteboard";

const initialState: WhiteboardState = {
  tools: {
    current: "pen",
    strokeWidth: 2,
    color: "#000000",
  },
  history: {
    past: [],
    future: [],
  },
  zoom: 1,
  pan: { x: 0, y: 0 },
};

const whiteboardReducer = (
  state: WhiteboardState,
  action: WhiteboardAction
): WhiteboardState => {
  switch (action.type) {
    case "SET_TOOL":
      return {
        ...state,
        tools: {
          ...state.tools,
          current: action.payload,
        },
      };
    case "SET_STROKE_WIDTH":
      return {
        ...state,
        tools: {
          ...state.tools,
          strokeWidth: action.payload,
        },
      };
    case "SET_COLOR":
      return {
        ...state,
        tools: {
          ...state.tools,
          color: action.payload,
        },
      };
    case "SET_ZOOM":
      return {
        ...state,
        zoom: action.payload,
      };
    case "SET_PAN":
      return {
        ...state,
        pan: action.payload,
      };
    case "ADD_TO_HISTORY":
      return {
        ...state,
        history: {
          past: [...state.history.past, action.payload],
          future: [],
        },
      };
    case "UNDO":
      if (state.history.past.length === 0) return state;
      const previous = state.history.past[state.history.past.length - 1];
      const newPast = state.history.past.slice(0, -1);
      return {
        ...state,
        history: {
          past: newPast,
          future: [previous, ...state.history.future],
        },
      };
    case "REDO":
      if (state.history.future.length === 0) return state;
      const next = state.history.future[0];
      const newFuture = state.history.future.slice(1);
      return {
        ...state,
        history: {
          past: [...state.history.past, next],
          future: newFuture,
        },
      };
    default:
      return state;
  }
};

const WhiteboardContext = createContext<{
  state: WhiteboardState;
  dispatch: React.Dispatch<WhiteboardAction>;
} | null>(null);

export const useWhiteboard = () => {
  const context = useContext(WhiteboardContext);
  if (!context) {
    throw new Error("useWhiteboard must be used within a WhiteboardProvider");
  }
  return context;
};

interface WhiteboardProviderProps {
  children: ReactNode;
}

export const WhiteboardProvider: React.FC<WhiteboardProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(whiteboardReducer, initialState);

  return (
    <WhiteboardContext.Provider value={{ state, dispatch }}>
      {children}
    </WhiteboardContext.Provider>
  );
};
