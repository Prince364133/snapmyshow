export const SEAT_TEMPLATES = [
  {
    id: "boutique",
    name: "Boutique Studio",
    description: "Intimate setting, 40-50 seats.",
    rows: 6,
    cols: 8,
    layout: (rows: number, cols: number) => {
      const layout = [];
      for (let r = 0; r < rows; r++) {
        const rowLabel = String.fromCharCode(65 + r);
        for (let c = 1; c <= cols; c++) {
          layout.push({
            row: rowLabel,
            col: c,
            type: r < 2 ? "PREMIUM" : "STANDARD",
            price: r < 2 ? 350 : 250,
            isActive: true
          });
        }
      }
      return layout;
    }
  },
  {
    id: "standard",
    name: "Standard Cinema",
    description: "Classic auditorium, ~120 seats.",
    rows: 10,
    cols: 12,
    layout: (rows: number, cols: number) => {
      const layout = [];
      for (let r = 0; r < rows; r++) {
        const rowLabel = String.fromCharCode(65 + r);
        for (let c = 1; c <= cols; c++) {
          layout.push({
            row: rowLabel,
            col: c,
            type: r < 2 ? "RECLINER" : r < 5 ? "PREMIUM" : "STANDARD",
            price: r < 2 ? 550 : r < 5 ? 400 : 250,
            isActive: true
          });
        }
      }
      return layout;
    }
  },
  {
    id: "platinum",
    name: "Platinum Suite",
    description: "Luxury layout with recliners only.",
    rows: 4,
    cols: 6,
    layout: (rows: number, cols: number) => {
      const layout = [];
      for (let r = 0; r < rows; r++) {
        const rowLabel = String.fromCharCode(65 + r);
        for (let c = 1; c <= cols; c++) {
          layout.push({
            row: rowLabel,
            col: c,
            type: "RECLINER",
            price: 800,
            isActive: true
          });
        }
      }
      return layout;
    }
  },
  {
    id: "aisle-split",
    name: "Aisle Split",
    description: "Center aisle for easy access.",
    rows: 10,
    cols: 16,
    layout: (rows: number, cols: number) => {
      const layout = [];
      for (let r = 0; r < rows; r++) {
        const rowLabel = String.fromCharCode(65 + r);
        for (let c = 1; c <= cols; c++) {
          // Create a gap at cols 8 and 9
          const isActive = c !== 8 && c !== 9;
          layout.push({
            row: rowLabel,
            col: c,
            type: r < 2 ? "PREMIUM" : "STANDARD",
            price: r < 2 ? 450 : 300,
            isActive: isActive
          });
        }
      }
      return layout;
    }
  },
  {
    id: "grand-hall",
    name: "Grand Hall",
    description: "Massive seating capacity, 300+ seats.",
    rows: 15,
    cols: 20,
    layout: (rows: number, cols: number) => {
      const layout = [];
      for (let r = 0; r < rows; r++) {
        const rowLabel = String.fromCharCode(65 + r);
        for (let c = 1; c <= cols; c++) {
          layout.push({
            row: rowLabel,
            col: c,
            type: r < 3 ? "PREMIUM" : "STANDARD",
            price: r < 3 ? 500 : 200,
            isActive: true
          });
        }
      }
      return layout;
    }
  },
  {
    id: "stadium",
    name: "Stadium Tier",
    description: "Elevated tier seating, wide rows.",
    rows: 8,
    cols: 25,
    layout: (rows: number, cols: number) => {
      const layout = [];
      for (let r = 0; r < rows; r++) {
        const rowLabel = String.fromCharCode(65 + r);
        for (let c = 1; c <= cols; c++) {
          layout.push({
            row: rowLabel,
            col: c,
            type: r === 0 ? "RECLINER" : "STANDARD",
            price: r === 0 ? 600 : 300,
            isActive: true
          });
        }
      }
      return layout;
    }
  }
];
