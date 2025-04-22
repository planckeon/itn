import type p5 from "p5";

declare module "p5js-wrapper" {
    export interface P5SketchInstance extends p5 {
        setPlaying?: (isPlaying: boolean) => void;
        updateSimParams?: (params: import("../physics/types").OscillationParameters) => void;
        setSimSpeed?: (speed: number) => void;
        resetSimulation?: () => void;
    }
}
