import colors from './colors';

interface Breakpoints extends Array<string> {
  xs?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  xxl?: string;
}

let breakpoints: Breakpoints = [
  '480px',
  '600px',
  '900px',
  '1200px',
  '1400px',
  '1600px',
];

breakpoints = {
  ...breakpoints,
  ...{
    xs: breakpoints[0],
    sm: breakpoints[1],
    md: breakpoints[2],
    lg: breakpoints[3],
    xl: breakpoints[4],
    xxl: breakpoints[5],
  },
};

export default {
  breakpoints,
  colors,
  space: [0, 5, 10, 15, 20, 25, 30],
};
