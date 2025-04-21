import React, { createContext, useContext, useReducer, Dispatch } from "react";
import { z } from "zod";
import { defaultOscParams } from "./physics/constants";
import type {
  OscillationParameters,
  NeutrinoFlavor,
  // Removed unused: PlotParameters
  TooltipState,
} from "./physics/types";
import {
  calculateNuFastProbs,
  // Removed unused: getProbabilitiesForInitialFlavor
} from "./physics/NuFastPort";

// --- State Types ---
export interface SimParamsState extends Omit<OscillationParameters, "L"> {
  maxL: number;
  initialFlavorIndex: NeutrinoFlavor;
}
export interface AnimationState {
  isPlaying: boolean;
  currentL: number;
  simSpeed: number;
  lastTimestamp: number;
}
export interface PlotParamsState {
  numPoints: number;
}
export interface TooltipsState {
  visible: TooltipState;
}

// --- Initial States ---
const simParamsInitial: SimParamsState = {
  ...defaultOscParams,
  maxL: 1000,
  initialFlavorIndex: 0,
};
const animationInitial: AnimationState = {
  isPlaying: false,
  currentL: 0,
  simSpeed: 2,
  lastTimestamp: 0,
};
const plotParamsInitial: PlotParamsState = {
  numPoints: 200,
};
const tooltipsInitial: TooltipsState = {
  visible: {},
};
 
// --- Zod Schemas for Simulation Parameters ---
export const SimParamsSchema = z.object({
  theta12_deg: z.number().min(0).max(90),
  theta13_deg: z.number().min(0).max(90),
  theta23_deg: z.number().min(0).max(90),
  deltaCP_deg: z.number().min(0).max(360),
  dm21sq_eV2: z.number().positive(),
  dm31sq_eV2: z.number(),
  energy: z.number(),
  rho: z.number().optional(),
  Ye: z.number().min(0).max(1).optional(),
  matterEffect: z.boolean().optional(),
  maxL: z.number().positive(),
  initialFlavorIndex: z.union([z.literal(0), z.literal(1), z.literal(2)]),
});

// --- Zod Validation Integration ---
function validateSimParam(key: keyof SimParamsState, value: any, state: SimParamsState) {
  try {
    // Validate the updated state with the new value
    SimParamsSchema.parse({ ...state, [key]: value });
    return null;
  } catch (err) {
    console.error("Validation error for", key, value, err);
    return err;
  }
}
// --- Reducers ---
type SimParamsAction =
  | { type: "SET_PARAM"; key: keyof SimParamsState; value: any }
  | { type: "SET_DENSITY"; value: number }
  | { type: "TOGGLE_MATTER_EFFECT"; value?: boolean };

function simParamsReducer(state: SimParamsState, action: SimParamsAction): SimParamsState {
  switch (action.type) {
    case "SET_PARAM":
      // Validate input before updating state
      const validationError = validateSimParam(action.key, action.value, state);
      if (validationError) {
        // Optionally, set error state here or just log
        return state;
      }
      return { ...state, [action.key]: action.value };
    case "SET_DENSITY":
      return {
        ...state,
        rho: action.value,
        matterEffect: action.value > 0 ? true : false,
      };
    case "TOGGLE_MATTER_EFFECT":
      return {
        ...state,
        matterEffect: action.value !== undefined ? action.value : !state.matterEffect,
      };
    default:
      return state;
  }
}

type AnimationAction =
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "RESET" }
  | { type: "TOGGLE" }
  | { type: "SET_SPEED"; value: number }
  | { type: "UPDATE_L"; timestamp: number; maxL: number };

function animationReducer(state: AnimationState, action: AnimationAction): AnimationState {
  switch (action.type) {
    case "PLAY":
      return { ...state, isPlaying: true };
    case "PAUSE":
      return { ...state, isPlaying: false };
    case "RESET":
      return { ...state, currentL: 0, isPlaying: false };
    case "TOGGLE":
      return { ...state, isPlaying: !state.isPlaying };
    case "SET_SPEED":
      return { ...state, simSpeed: action.value };
    case "UPDATE_L": {
      if (!state.isPlaying) return { ...state, lastTimestamp: action.timestamp };
      if (state.lastTimestamp === 0) return { ...state, lastTimestamp: action.timestamp };
      const deltaTime = action.timestamp - state.lastTimestamp;
      const distancePerSecond = action.maxL / 20;
      const deltaL = (deltaTime / 1000) * state.simSpeed * distancePerSecond;
      let newL = state.currentL + deltaL;
      if (newL > action.maxL) newL %= action.maxL;
      return { ...state, currentL: newL, lastTimestamp: action.timestamp };
    }
    default:
      return state;
  }
}

type PlotParamsAction = { type: "SET_NUM_POINTS"; value: number };
function plotParamsReducer(state: PlotParamsState, action: PlotParamsAction): PlotParamsState {
  switch (action.type) {
    case "SET_NUM_POINTS":
      return { ...state, numPoints: action.value };
    default:
      return state;
  }
}

type TooltipsAction =
  | { type: "SHOW"; id: string }
  | { type: "HIDE"; id: string }
  | { type: "TOGGLE"; id: string };

function tooltipsReducer(state: TooltipsState, action: TooltipsAction): TooltipsState {
  switch (action.type) {
    case "SHOW":
      return { ...state, visible: { ...state.visible, [action.id]: true } };
    case "HIDE":
      return { ...state, visible: { ...state.visible, [action.id]: false } };
    case "TOGGLE":
      return { ...state, visible: { ...state.visible, [action.id]: !state.visible[action.id] } };
    default:
      return state;
  }
}

// --- Contexts ---
export interface StateContextType {
  simParams: [SimParamsState, Dispatch<SimParamsAction>];
  animation: [AnimationState, Dispatch<AnimationAction>];
  plotParams: [PlotParamsState, Dispatch<PlotParamsAction>];
  tooltips: [TooltipsState, Dispatch<TooltipsAction>];
}
const StateContext = createContext<StateContextType | undefined>(undefined);

export const StateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const simParams = useReducer(simParamsReducer, simParamsInitial);
  const animation = useReducer(animationReducer, animationInitial);
  const plotParams = useReducer(plotParamsReducer, plotParamsInitial);
  const tooltips = useReducer(tooltipsReducer, tooltipsInitial);

  return (
    <StateContext.Provider value={{ simParams, animation, plotParams, tooltips }}>
      {children}
    </StateContext.Provider>
  );
};

export function useAppState() {
  const ctx = useContext(StateContext);
  if (!ctx) throw new Error("useAppState must be used within a StateProvider");
  return ctx;
}