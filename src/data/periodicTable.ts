// Full 118-element data with category colors
export const cat = {
  "alkali-metal": "#f87171",
  "alkaline-earth": "#fbbf24",
  "transition-metal": "#60a5fa",
  "post-transition": "#94a3b8",
  "metalloid": "#a78bfa",
  "nonmetal": "#4ade80",
  "halogen": "#fb923c",
  "noble-gas": "#818cf8",
  "lanthanide": "#f472b6",
  "actinide": "#ec4899",
} as const;

export type Category = keyof typeof cat;

export interface Element {
  symbol: string; name: string; number: number; mass: string; category: Category;
  color: string; col: number; row: number; electrons: number[]; description: string;
}

// Helper to compute electron shells using simple noble-gas filling
function shells(n: number): number[] {
  const caps = [2, 8, 8, 18, 18, 32, 32];
  const out: number[] = [];
  let left = n;
  for (const c of caps) {
    if (left <= 0) break;
    const take = Math.min(c, left);
    out.push(take);
    left -= take;
  }
  return out;
}

const raw: Array<[number, string, string, string, Category, number, number, string]> = [
  // [number, symbol, name, mass, category, col, row, description]
  [1,"H","Hydrogen","1.008","nonmetal",0,0,"Lightest, most abundant element."],
  [2,"He","Helium","4.003","noble-gas",17,0,"Inert noble gas, second most abundant in universe."],
  [3,"Li","Lithium","6.941","alkali-metal",0,1,"Soft, silvery alkali metal used in batteries."],
  [4,"Be","Beryllium","9.012","alkaline-earth",1,1,"Lightweight, stiff, used in aerospace."],
  [5,"B","Boron","10.81","metalloid",12,1,"Hard metalloid, essential for plants."],
  [6,"C","Carbon","12.011","nonmetal",13,1,"Foundation of organic chemistry — basis of life."],
  [7,"N","Nitrogen","14.007","nonmetal",14,1,"78% of atmosphere; key to amino acids and DNA."],
  [8,"O","Oxygen","15.999","nonmetal",15,1,"Essential for respiration; 21% of atmosphere."],
  [9,"F","Fluorine","18.998","halogen",16,1,"Most electronegative element."],
  [10,"Ne","Neon","20.180","noble-gas",17,1,"Glows red-orange in discharge tubes."],
  [11,"Na","Sodium","22.990","alkali-metal",0,2,"Reactive metal; component of table salt."],
  [12,"Mg","Magnesium","24.305","alkaline-earth",1,2,"Burns bright white; in chlorophyll."],
  [13,"Al","Aluminum","26.982","post-transition",12,2,"Light, corrosion-resistant; most abundant metal in crust."],
  [14,"Si","Silicon","28.085","metalloid",13,2,"Backbone of electronics; 28% of crust."],
  [15,"P","Phosphorus","30.974","nonmetal",14,2,"Essential for DNA, ATP, bones."],
  [16,"S","Sulfur","32.06","nonmetal",15,2,"Yellow nonmetal; volcanic."],
  [17,"Cl","Chlorine","35.45","halogen",16,2,"Yellow-green toxic gas; powerful disinfectant."],
  [18,"Ar","Argon","39.948","noble-gas",17,2,"1% of atmosphere; used in welding."],
  [19,"K","Potassium","39.098","alkali-metal",0,3,"Vital electrolyte; burns lilac."],
  [20,"Ca","Calcium","40.078","alkaline-earth",1,3,"Major component of bones, teeth."],
  [21,"Sc","Scandium","44.956","transition-metal",2,3,"Light transition metal used in alloys."],
  [22,"Ti","Titanium","47.867","transition-metal",3,3,"Strong, lightweight, biocompatible."],
  [23,"V","Vanadium","50.942","transition-metal",4,3,"Hardens steel."],
  [24,"Cr","Chromium","51.996","transition-metal",5,3,"Hard; used in chrome plating."],
  [25,"Mn","Manganese","54.938","transition-metal",6,3,"Trace element; used in steel."],
  [26,"Fe","Iron","55.845","transition-metal",7,3,"Most common element on Earth by mass."],
  [27,"Co","Cobalt","58.933","transition-metal",8,3,"Magnetic; used in batteries."],
  [28,"Ni","Nickel","58.693","transition-metal",9,3,"Corrosion-resistant; coin metal."],
  [29,"Cu","Copper","63.546","transition-metal",10,3,"Excellent conductor."],
  [30,"Zn","Zinc","65.38","transition-metal",11,3,"Galvanizes steel."],
  [31,"Ga","Gallium","69.723","post-transition",12,3,"Melts in your hand."],
  [32,"Ge","Germanium","72.63","metalloid",13,3,"Semiconductor."],
  [33,"As","Arsenic","74.922","metalloid",14,3,"Toxic metalloid."],
  [34,"Se","Selenium","78.971","nonmetal",15,3,"Photovoltaic; trace nutrient."],
  [35,"Br","Bromine","79.904","halogen",16,3,"Only liquid nonmetal at room temp."],
  [36,"Kr","Krypton","83.798","noble-gas",17,3,"Used in some lasers."],
  [37,"Rb","Rubidium","85.468","alkali-metal",0,4,"Soft, highly reactive."],
  [38,"Sr","Strontium","87.62","alkaline-earth",1,4,"Bright red flame; fireworks."],
  [39,"Y","Yttrium","88.906","transition-metal",2,4,"Used in LEDs and superconductors."],
  [40,"Zr","Zirconium","91.224","transition-metal",3,4,"Corrosion-resistant; nuclear fuel rods."],
  [41,"Nb","Niobium","92.906","transition-metal",4,4,"Used in superconducting magnets."],
  [42,"Mo","Molybdenum","95.95","transition-metal",5,4,"Strengthens steel."],
  [43,"Tc","Technetium","98","transition-metal",6,4,"First synthetic element."],
  [44,"Ru","Ruthenium","101.07","transition-metal",7,4,"Catalyst; hard."],
  [45,"Rh","Rhodium","102.91","transition-metal",8,4,"Catalytic converters."],
  [46,"Pd","Palladium","106.42","transition-metal",9,4,"Catalyst; jewelry."],
  [47,"Ag","Silver","107.87","transition-metal",10,4,"Highest electrical conductivity."],
  [48,"Cd","Cadmium","112.41","transition-metal",11,4,"Toxic; used in batteries."],
  [49,"In","Indium","114.82","post-transition",12,4,"Soft metal; touchscreens."],
  [50,"Sn","Tin","118.71","post-transition",13,4,"Used in solder."],
  [51,"Sb","Antimony","121.76","metalloid",14,4,"Hardens lead alloys."],
  [52,"Te","Tellurium","127.60","metalloid",15,4,"Solar panels."],
  [53,"I","Iodine","126.90","halogen",16,4,"Purple solid; thyroid nutrient."],
  [54,"Xe","Xenon","131.29","noble-gas",17,4,"Used in flash lamps."],
  [55,"Cs","Cesium","132.91","alkali-metal",0,5,"Defines the second."],
  [56,"Ba","Barium","137.33","alkaline-earth",1,5,"Heavy; medical contrast."],
  [57,"La","Lanthanum","138.91","lanthanide",2,5,"Used in optical lenses."],
  [72,"Hf","Hafnium","178.49","transition-metal",3,5,"Used in nuclear control rods."],
  [73,"Ta","Tantalum","180.95","transition-metal",4,5,"Capacitors in electronics."],
  [74,"W","Tungsten","183.84","transition-metal",5,5,"Highest melting point of metals."],
  [75,"Re","Rhenium","186.21","transition-metal",6,5,"Jet engine alloys."],
  [76,"Os","Osmium","190.23","transition-metal",7,5,"Densest element."],
  [77,"Ir","Iridium","192.22","transition-metal",8,5,"Very dense; meteorite marker."],
  [78,"Pt","Platinum","195.08","transition-metal",9,5,"Catalysts; jewelry."],
  [79,"Au","Gold","196.97","transition-metal",10,5,"Precious; unreactive conductor."],
  [80,"Hg","Mercury","200.59","transition-metal",11,5,"Liquid metal at room temp."],
  [81,"Tl","Thallium","204.38","post-transition",12,5,"Toxic; once used in rat poison."],
  [82,"Pb","Lead","207.2","post-transition",13,5,"Dense, soft, toxic."],
  [83,"Bi","Bismuth","208.98","post-transition",14,5,"Beautiful iridescent crystals."],
  [84,"Po","Polonium","209","metalloid",15,5,"Highly radioactive."],
  [85,"At","Astatine","210","halogen",16,5,"Rarest natural element."],
  [86,"Rn","Radon","222","noble-gas",17,5,"Radioactive gas."],
  [87,"Fr","Francium","223","alkali-metal",0,6,"Extremely rare; radioactive."],
  [88,"Ra","Radium","226","alkaline-earth",1,6,"Glow-in-dark; radioactive."],
  [89,"Ac","Actinium","227","actinide",2,6,"Radioactive; cancer therapy."],
  [104,"Rf","Rutherfordium","267","transition-metal",3,6,"Synthetic, very short-lived."],
  [105,"Db","Dubnium","268","transition-metal",4,6,"Synthetic superheavy."],
  [106,"Sg","Seaborgium","269","transition-metal",5,6,"Synthetic."],
  [107,"Bh","Bohrium","270","transition-metal",6,6,"Synthetic."],
  [108,"Hs","Hassium","277","transition-metal",7,6,"Synthetic."],
  [109,"Mt","Meitnerium","278","transition-metal",8,6,"Synthetic."],
  [110,"Ds","Darmstadtium","281","transition-metal",9,6,"Synthetic."],
  [111,"Rg","Roentgenium","282","transition-metal",10,6,"Synthetic."],
  [112,"Cn","Copernicium","285","transition-metal",11,6,"Synthetic."],
  [113,"Nh","Nihonium","286","post-transition",12,6,"Synthetic."],
  [114,"Fl","Flerovium","289","post-transition",13,6,"Synthetic."],
  [115,"Mc","Moscovium","290","post-transition",14,6,"Synthetic."],
  [116,"Lv","Livermorium","293","post-transition",15,6,"Synthetic."],
  [117,"Ts","Tennessine","294","halogen",16,6,"Synthetic."],
  [118,"Og","Oganesson","294","noble-gas",17,6,"Heaviest element synthesized."],
  // Lanthanides (row 8 in display)
  [58,"Ce","Cerium","140.12","lanthanide",3,8,"Catalytic converters; flints."],
  [59,"Pr","Praseodymium","140.91","lanthanide",4,8,"Magnets."],
  [60,"Nd","Neodymium","144.24","lanthanide",5,8,"Strongest permanent magnets."],
  [61,"Pm","Promethium","145","lanthanide",6,8,"Radioactive; nuclear batteries."],
  [62,"Sm","Samarium","150.36","lanthanide",7,8,"Magnets and lasers."],
  [63,"Eu","Europium","151.96","lanthanide",8,8,"Phosphors in screens."],
  [64,"Gd","Gadolinium","157.25","lanthanide",9,8,"MRI contrast agent."],
  [65,"Tb","Terbium","158.93","lanthanide",10,8,"Green phosphors."],
  [66,"Dy","Dysprosium","162.50","lanthanide",11,8,"Magnets in motors."],
  [67,"Ho","Holmium","164.93","lanthanide",12,8,"Strongest magnetic moment."],
  [68,"Er","Erbium","167.26","lanthanide",13,8,"Fiber-optic amplifiers."],
  [69,"Tm","Thulium","168.93","lanthanide",14,8,"Portable X-ray sources."],
  [70,"Yb","Ytterbium","173.05","lanthanide",15,8,"Stress gauges; lasers."],
  [71,"Lu","Lutetium","174.97","lanthanide",16,8,"Catalyst; PET imaging."],
  // Actinides (row 9 in display)
  [90,"Th","Thorium","232.04","actinide",3,9,"Potential nuclear fuel."],
  [91,"Pa","Protactinium","231.04","actinide",4,9,"Rare radioactive metal."],
  [92,"U","Uranium","238.03","actinide",5,9,"Nuclear fuel."],
  [93,"Np","Neptunium","237","actinide",6,9,"First transuranic element."],
  [94,"Pu","Plutonium","244","actinide",7,9,"Nuclear weapons & reactors."],
  [95,"Am","Americium","243","actinide",8,9,"Smoke detectors."],
  [96,"Cm","Curium","247","actinide",9,9,"Radioisotope power."],
  [97,"Bk","Berkelium","247","actinide",10,9,"Synthetic."],
  [98,"Cf","Californium","251","actinide",11,9,"Neutron source."],
  [99,"Es","Einsteinium","252","actinide",12,9,"Synthetic."],
  [100,"Fm","Fermium","257","actinide",13,9,"Synthetic."],
  [101,"Md","Mendelevium","258","actinide",14,9,"Synthetic."],
  [102,"No","Nobelium","259","actinide",15,9,"Synthetic."],
  [103,"Lr","Lawrencium","266","actinide",16,9,"Synthetic."],
];

export const elements: Element[] = raw.map(([number, symbol, name, mass, category, col, row, description]) => ({
  number, symbol, name, mass, category, col, row, description,
  color: cat[category], electrons: shells(number),
}));
