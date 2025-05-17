const HeuristicColors: { [key: string]: string } = {
  "1": "#4C83EE",
  "2": "#5EC169",
  "3": "#EAB30A",
  "4": "#EF4444",
  "5": "#A854F7",
  "6": "#DA5697",
  "7": "#6269E9",
  "8": "#E97A35",
  "9": "#54B5A6",
  "10": "#51B4D0",
};

export const getHeuristicColor = (code: string): string => {
  return HeuristicColors[code] || "#000000"; // Default to black if not found
};
