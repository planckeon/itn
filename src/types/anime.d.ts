declare namespace anime {
  interface AnimeInstance {
    pause: () => void;
    play: () => void;
    restart: () => void;
    reverse: () => void;
    seek: (time: number) => void;
    duration: number;
  }

  interface AnimeParams {
    targets: any;
    duration?: number;
    delay?: number | ((el: any, i: number, l: number) => number);
    endDelay?: number;
    easing?: string;
    round?: number;
    loop?: number | boolean;
    direction?: 'normal' | 'reverse' | 'alternate';
    update?: (anim: any) => void;
    [property: string]: any;
  }
}

declare function anime(params: anime.AnimeParams): anime.AnimeInstance;

export = anime;
export as namespace anime;