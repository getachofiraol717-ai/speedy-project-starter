import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, CheckCircle, XCircle, ArrowLeft, ArrowRight,
  RotateCcw, Sparkles, Brain, Zap, Target,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  category: string;
}

const allQuestions: Question[] = [
  // Biology
  { id: 1, category: "Biology", question: "What is the powerhouse of the cell?", options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi Apparatus"], correct: 1, explanation: "Mitochondria generate most of the cell's supply of ATP, the energy currency." },
  { id: 2, category: "Biology", question: "DNA stands for:", options: ["Deoxyribonucleic Acid", "Dinitrogen Acid", "Deoxyribose Nucleotide Acid", "Dynamic Nucleic Acid"], correct: 0, explanation: "DNA — Deoxyribonucleic Acid — carries genetic instructions for life." },
  { id: 3, category: "Biology", question: "Which organelle is responsible for protein synthesis?", options: ["Mitochondria", "Lysosome", "Ribosome", "Vacuole"], correct: 2, explanation: "Ribosomes translate mRNA into protein chains through translation." },
  { id: 4, category: "Biology", question: "What is the process by which cells divide to produce two identical daughter cells?", options: ["Meiosis", "Mitosis", "Binary Fission", "Budding"], correct: 1, explanation: "Mitosis produces two genetically identical daughter cells for growth and repair." },
  { id: 5, category: "Biology", question: "Which blood cells are responsible for carrying oxygen?", options: ["White blood cells", "Platelets", "Red blood cells", "Plasma"], correct: 2, explanation: "Red blood cells contain hemoglobin which binds to oxygen for transport." },
  { id: 6, category: "Biology", question: "What is the largest organ of the human body?", options: ["Liver", "Brain", "Skin", "Lungs"], correct: 2, explanation: "The skin is the largest organ, covering about 1.5-2 square meters in adults." },
  { id: 7, category: "Biology", question: "Which vitamin is produced when skin is exposed to sunlight?", options: ["Vitamin A", "Vitamin B12", "Vitamin C", "Vitamin D"], correct: 3, explanation: "UV-B radiation triggers Vitamin D synthesis in the skin." },
  { id: 8, category: "Biology", question: "What is the functional unit of the kidney?", options: ["Nephron", "Neuron", "Alveolus", "Villus"], correct: 0, explanation: "Each kidney contains about 1 million nephrons that filter blood and produce urine." },
  { id: 9, category: "Biology", question: "Which part of the brain controls balance and coordination?", options: ["Cerebrum", "Cerebellum", "Medulla", "Thalamus"], correct: 1, explanation: "The cerebellum coordinates voluntary movements, balance, and motor learning." },
  { id: 10, category: "Biology", question: "What is the role of enzymes in biological reactions?", options: ["Provide energy", "Act as catalysts", "Store information", "Transport molecules"], correct: 1, explanation: "Enzymes are biological catalysts that speed up reactions by lowering activation energy." },

  // Astronomy
  { id: 11, category: "Astronomy", question: "Which planet is known as the Red Planet?", options: ["Venus", "Jupiter", "Mars", "Saturn"], correct: 2, explanation: "Mars appears red due to iron oxide (rust) on its surface." },
  { id: 12, category: "Astronomy", question: "How many planets are in our solar system?", options: ["7", "8", "9", "10"], correct: 1, explanation: "There are 8 planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune." },
  { id: 13, category: "Astronomy", question: "What is the closest star to Earth?", options: ["Alpha Centauri", "Sirius", "Proxima Centauri", "The Sun"], correct: 3, explanation: "The Sun is the closest star to Earth at about 150 million km." },
  { id: 14, category: "Astronomy", question: "Which planet has the most moons?", options: ["Jupiter", "Saturn", "Uranus", "Neptune"], correct: 1, explanation: "Saturn has 146 confirmed moons, surpassing Jupiter's count." },
  { id: 15, category: "Astronomy", question: "What causes a solar eclipse?", options: ["Earth blocks the Sun", "Moon blocks the Sun", "Sun blocks the Moon", "Planets align"], correct: 1, explanation: "A solar eclipse occurs when the Moon passes between Earth and the Sun." },
  { id: 16, category: "Astronomy", question: "What is a light-year?", options: ["A unit of time", "A unit of distance", "A unit of brightness", "A unit of speed"], correct: 1, explanation: "A light-year is the distance light travels in one year — about 9.46 trillion km." },
  { id: 17, category: "Astronomy", question: "Which planet is known for its prominent ring system?", options: ["Jupiter", "Saturn", "Uranus", "Neptune"], correct: 1, explanation: "Saturn's rings are the most visible, made of ice and rock particles." },
  { id: 18, category: "Astronomy", question: "What type of galaxy is the Milky Way?", options: ["Elliptical", "Irregular", "Spiral", "Lenticular"], correct: 2, explanation: "The Milky Way is a barred spiral galaxy about 100,000 light-years in diameter." },

  // Chemistry
  { id: 19, category: "Chemistry", question: "What is the chemical formula for water?", options: ["CO₂", "H₂O", "NaCl", "O₂"], correct: 1, explanation: "Water consists of two hydrogen atoms bonded to one oxygen atom." },
  { id: 20, category: "Chemistry", question: "What is the atomic number of Carbon?", options: ["4", "6", "8", "12"], correct: 1, explanation: "Carbon has 6 protons in its nucleus, giving it atomic number 6." },
  { id: 21, category: "Chemistry", question: "What type of bond involves sharing of electrons?", options: ["Ionic", "Covalent", "Metallic", "Hydrogen"], correct: 1, explanation: "Covalent bonds form when atoms share electron pairs to achieve stability." },
  { id: 22, category: "Chemistry", question: "What is the pH of a neutral solution?", options: ["0", "5", "7", "14"], correct: 2, explanation: "A pH of 7 is neutral — below 7 is acidic, above 7 is basic." },
  { id: 23, category: "Chemistry", question: "Which gas is most abundant in Earth's atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"], correct: 2, explanation: "Nitrogen makes up about 78% of Earth's atmosphere." },
  { id: 24, category: "Chemistry", question: "What is Avogadro's number?", options: ["6.022 × 10²³", "3.14 × 10⁸", "1.602 × 10⁻¹⁹", "9.81 × 10¹"], correct: 0, explanation: "Avogadro's number (6.022 × 10²³) is the number of atoms/molecules in one mole." },
  { id: 25, category: "Chemistry", question: "Which element has the symbol 'Fe'?", options: ["Fluorine", "Francium", "Iron", "Fermium"], correct: 2, explanation: "Fe comes from the Latin word 'ferrum' meaning iron." },
  { id: 26, category: "Chemistry", question: "What is an exothermic reaction?", options: ["Absorbs heat", "Releases heat", "Absorbs light", "Releases electrons"], correct: 1, explanation: "Exothermic reactions release energy as heat to the surroundings." },
  { id: 27, category: "Chemistry", question: "Which subatomic particle has a negative charge?", options: ["Proton", "Neutron", "Electron", "Photon"], correct: 2, explanation: "Electrons carry a negative charge and orbit the nucleus." },

  // Physics
  { id: 28, category: "Physics", question: "What is the speed of light in vacuum?", options: ["3×10⁶ m/s", "3×10⁸ m/s", "3×10¹⁰ m/s", "3×10⁴ m/s"], correct: 1, explanation: "The speed of light in a vacuum is approximately 3×10⁸ meters per second." },
  { id: 29, category: "Physics", question: "Which law states 'For every action there is an equal and opposite reaction'?", options: ["Newton's 1st Law", "Newton's 2nd Law", "Newton's 3rd Law", "Law of Gravity"], correct: 2, explanation: "Newton's Third Law of Motion describes action-reaction force pairs." },
  { id: 30, category: "Physics", question: "What is the unit of electric current?", options: ["Volt", "Watt", "Ohm", "Ampere"], correct: 3, explanation: "The ampere (A) is the SI unit of electric current." },
  { id: 31, category: "Physics", question: "What is the SI unit of force?", options: ["Joule", "Newton", "Pascal", "Watt"], correct: 1, explanation: "The Newton (N) is defined as kg·m/s² — the force to accelerate 1 kg by 1 m/s²." },
  { id: 32, category: "Physics", question: "What is the acceleration due to gravity on Earth?", options: ["9.8 m/s²", "10.2 m/s²", "8.5 m/s²", "11.0 m/s²"], correct: 0, explanation: "Standard gravity on Earth's surface is approximately 9.8 m/s²." },
  { id: 33, category: "Physics", question: "What type of energy does a moving object have?", options: ["Potential", "Kinetic", "Thermal", "Chemical"], correct: 1, explanation: "Kinetic energy is the energy of motion, calculated as ½mv²." },
  { id: 34, category: "Physics", question: "What phenomenon explains why a straw appears bent in water?", options: ["Reflection", "Refraction", "Diffraction", "Dispersion"], correct: 1, explanation: "Refraction is the bending of light as it passes between media of different densities." },
  { id: 35, category: "Physics", question: "What is the first law of thermodynamics?", options: ["Energy cannot be created or destroyed", "Entropy always increases", "Absolute zero is unattainable", "Heat flows from hot to cold"], correct: 0, explanation: "The first law states energy is conserved — it can only change form." },
  { id: 36, category: "Physics", question: "What is the formula for Ohm's Law?", options: ["F = ma", "V = IR", "E = mc²", "P = IV"], correct: 1, explanation: "Ohm's Law: Voltage (V) = Current (I) × Resistance (R)." },
  { id: 37, category: "Physics", question: "Which particle is responsible for the electromagnetic force?", options: ["Gluon", "Graviton", "Photon", "W Boson"], correct: 2, explanation: "Photons are the force carriers (gauge bosons) of the electromagnetic force." },

  // Entrance-style mixed
  { id: 38, category: "Biology", question: "During photosynthesis, which gas is absorbed by plants?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correct: 2, explanation: "Plants absorb CO₂ and use light energy to convert it into glucose and O₂." },
  { id: 39, category: "Chemistry", question: "What is the molecular formula of glucose?", options: ["C₆H₁₂O₆", "C₂H₅OH", "CH₄", "C₁₂H₂₂O₁₁"], correct: 0, explanation: "Glucose (C₆H₁₂O₆) is a simple sugar and primary energy source for cells." },
  { id: 40, category: "Physics", question: "A body at rest stays at rest unless acted upon by a force. This is:", options: ["Newton's 1st Law", "Newton's 2nd Law", "Newton's 3rd Law", "Law of Conservation"], correct: 0, explanation: "Newton's First Law (Law of Inertia) describes the tendency to resist changes in motion." },

  // Additional Biology
  { id: 41, category: "Biology", question: "Which structure controls what enters and exits a cell?", options: ["Cell wall", "Cell membrane", "Nucleus", "Cytoplasm"], correct: 1, explanation: "The cell membrane is selectively permeable, regulating molecular traffic." },
  { id: 42, category: "Biology", question: "What is the main function of red bone marrow?", options: ["Filter blood", "Produce blood cells", "Store fat", "Make hormones"], correct: 1, explanation: "Red bone marrow produces red blood cells, white blood cells, and platelets." },
  { id: 43, category: "Biology", question: "Which gland is known as the master gland?", options: ["Thyroid", "Adrenal", "Pituitary", "Pancreas"], correct: 2, explanation: "The pituitary gland controls many other endocrine glands in the body." },
  { id: 44, category: "Biology", question: "What is the basic unit of the nervous system?", options: ["Neuron", "Axon", "Synapse", "Glia"], correct: 0, explanation: "Neurons transmit electrical and chemical signals throughout the body." },
  { id: 45, category: "Biology", question: "Which process converts glucose to ATP without oxygen?", options: ["Aerobic respiration", "Anaerobic respiration", "Photosynthesis", "Transpiration"], correct: 1, explanation: "Anaerobic respiration (fermentation) produces ATP without using oxygen." },

  // Additional Chemistry
  { id: 46, category: "Chemistry", question: "Which element is the lightest?", options: ["Helium", "Hydrogen", "Lithium", "Carbon"], correct: 1, explanation: "Hydrogen has just one proton — the lightest and most abundant element." },
  { id: 47, category: "Chemistry", question: "What does a catalyst do in a reaction?", options: ["Becomes consumed", "Increases activation energy", "Speeds up reaction", "Stops reaction"], correct: 2, explanation: "Catalysts lower activation energy and speed up reactions without being consumed." },
  { id: 48, category: "Chemistry", question: "What are isotopes?", options: ["Same element, different protons", "Same element, different neutrons", "Different elements, same mass", "Charged atoms"], correct: 1, explanation: "Isotopes are atoms of the same element with different numbers of neutrons." },
  { id: 49, category: "Chemistry", question: "Which is a noble gas?", options: ["Oxygen", "Chlorine", "Argon", "Sodium"], correct: 2, explanation: "Argon is in Group 18 — noble gases are stable due to full electron shells." },
  { id: 50, category: "Chemistry", question: "What is the most electronegative element?", options: ["Oxygen", "Fluorine", "Chlorine", "Nitrogen"], correct: 1, explanation: "Fluorine has the highest electronegativity (3.98 on the Pauling scale)." },

  // Additional Physics
  { id: 51, category: "Physics", question: "What is the unit of frequency?", options: ["Hertz", "Newton", "Joule", "Watt"], correct: 0, explanation: "Hertz (Hz) measures cycles per second." },
  { id: 52, category: "Physics", question: "Which color of light has the longest wavelength?", options: ["Blue", "Green", "Red", "Violet"], correct: 2, explanation: "Red light has wavelengths around 700 nm — the longest in the visible spectrum." },
  { id: 53, category: "Physics", question: "What is the formula for kinetic energy?", options: ["mgh", "½mv²", "mc²", "F·d"], correct: 1, explanation: "Kinetic energy KE = ½mv², where m is mass and v is velocity." },
  { id: 54, category: "Physics", question: "What happens to the resistance when wire length doubles?", options: ["Halves", "Stays same", "Doubles", "Quadruples"], correct: 2, explanation: "Resistance is directly proportional to length: R = ρL/A." },
  { id: 55, category: "Physics", question: "What is absolute zero in Celsius?", options: ["0°C", "-100°C", "-273.15°C", "-459°C"], correct: 2, explanation: "Absolute zero is -273.15°C or 0 Kelvin — the coldest possible temperature." },

  // Additional Astronomy
  { id: 56, category: "Astronomy", question: "What is the largest planet in our solar system?", options: ["Saturn", "Jupiter", "Neptune", "Uranus"], correct: 1, explanation: "Jupiter is over 11x Earth's diameter — the largest planet in our solar system." },
  { id: 57, category: "Astronomy", question: "What is a supernova?", options: ["A new planet", "An exploding star", "A black hole", "A galaxy collision"], correct: 1, explanation: "A supernova is the explosive death of a massive star." },
  { id: 58, category: "Astronomy", question: "What galaxy do we live in?", options: ["Andromeda", "Milky Way", "Triangulum", "Sombrero"], correct: 1, explanation: "Earth is in the Milky Way galaxy, which contains 100-400 billion stars." },
  { id: 59, category: "Astronomy", question: "Which moon is the largest in our solar system?", options: ["The Moon", "Titan", "Ganymede", "Europa"], correct: 2, explanation: "Ganymede (Jupiter's moon) is even larger than the planet Mercury." },
  { id: 60, category: "Astronomy", question: "What unit measures interstellar distances?", options: ["Kilometer", "Astronomical Unit", "Light-year", "Mile"], correct: 2, explanation: "A light-year — the distance light travels in one year — is used for stars and galaxies." },

  // Mixed entrance-style
  { id: 61, category: "Biology", question: "Which blood type is the universal donor?", options: ["A+", "B+", "AB+", "O-"], correct: 3, explanation: "O-negative has no A, B, or Rh antigens — safe for any recipient." },
  { id: 62, category: "Chemistry", question: "Which acid is found in the stomach?", options: ["Sulfuric acid", "Hydrochloric acid", "Nitric acid", "Acetic acid"], correct: 1, explanation: "Stomach acid is hydrochloric acid (HCl), aiding digestion." },
  { id: 63, category: "Physics", question: "What instrument measures atmospheric pressure?", options: ["Thermometer", "Barometer", "Hygrometer", "Anemometer"], correct: 1, explanation: "A barometer measures air pressure — useful in weather forecasting." },
  { id: 64, category: "Astronomy", question: "Which planet rotates on its side?", options: ["Saturn", "Neptune", "Uranus", "Venus"], correct: 2, explanation: "Uranus has an axial tilt of about 98°, rolling along its orbit." },
  { id: 65, category: "Biology", question: "Which type of joint is the elbow?", options: ["Ball-and-socket", "Hinge", "Pivot", "Saddle"], correct: 1, explanation: "The elbow is a hinge joint allowing flexion and extension." },

  // Expanded question bank
  { id: 66, category: "Biology", question: "What is the basic unit of life?", options: ["Atom", "Cell", "Molecule", "Tissue"], correct: 1, explanation: "The cell is the smallest structural and functional unit of life." },
  { id: 67, category: "Biology", question: "Which kingdom do mushrooms belong to?", options: ["Plantae", "Animalia", "Fungi", "Protista"], correct: 2, explanation: "Fungi are heterotrophic organisms that absorb nutrients." },
  { id: 68, category: "Biology", question: "What pigment makes plants green?", options: ["Carotene", "Chlorophyll", "Xanthophyll", "Anthocyanin"], correct: 1, explanation: "Chlorophyll absorbs red/blue light and reflects green." },
  { id: 69, category: "Biology", question: "How many chambers does the human heart have?", options: ["2", "3", "4", "5"], correct: 2, explanation: "Two atria and two ventricles." },
  { id: 70, category: "Biology", question: "What is the longest bone in the human body?", options: ["Tibia", "Femur", "Humerus", "Fibula"], correct: 1, explanation: "The femur (thigh bone) is the longest and strongest bone." },
  { id: 71, category: "Biology", question: "Which organ produces insulin?", options: ["Liver", "Pancreas", "Kidney", "Stomach"], correct: 1, explanation: "Beta cells in the pancreas secrete insulin." },
  { id: 72, category: "Biology", question: "What gas do plants release during photosynthesis?", options: ["CO2", "Nitrogen", "Oxygen", "Hydrogen"], correct: 2, explanation: "Photosynthesis splits water and releases O2." },
  { id: 73, category: "Biology", question: "Which scientist proposed natural selection?", options: ["Mendel", "Darwin", "Pasteur", "Lamarck"], correct: 1, explanation: "Charles Darwin's 1859 work 'On the Origin of Species'." },
  { id: 74, category: "Biology", question: "DNA replication is described as:", options: ["Conservative", "Semi-conservative", "Dispersive", "Random"], correct: 1, explanation: "Each new DNA has one old and one new strand." },
  { id: 75, category: "Biology", question: "What carries oxygen in the blood?", options: ["Plasma", "Platelets", "Hemoglobin", "Albumin"], correct: 2, explanation: "Hemoglobin in red blood cells binds oxygen." },
  { id: 76, category: "Biology", question: "Which type of RNA carries amino acids?", options: ["mRNA", "tRNA", "rRNA", "snRNA"], correct: 1, explanation: "Transfer RNA delivers amino acids during translation." },
  { id: 77, category: "Biology", question: "Which structure connects muscle to bone?", options: ["Ligament", "Tendon", "Cartilage", "Fascia"], correct: 1, explanation: "Tendons attach muscles to bones." },
  { id: 78, category: "Biology", question: "What is the smallest unit of heredity?", options: ["Chromosome", "Gene", "Nucleotide", "Codon"], correct: 1, explanation: "Genes are segments of DNA that code for traits." },
  { id: 79, category: "Biology", question: "Which blood vessel returns blood to the heart?", options: ["Artery", "Vein", "Capillary", "Aorta"], correct: 1, explanation: "Veins carry deoxygenated blood back (except pulmonary)." },
  { id: 80, category: "Biology", question: "Which process produces gametes?", options: ["Mitosis", "Meiosis", "Binary fission", "Cytokinesis"], correct: 1, explanation: "Meiosis halves chromosome number to make gametes." },
  { id: 81, category: "Biology", question: "What is the pH range of human blood?", options: ["6.0-6.4", "7.35-7.45", "8.0-8.4", "5.0-5.5"], correct: 1, explanation: "Blood is slightly alkaline at 7.35-7.45." },
  { id: 82, category: "Biology", question: "Which vitamin helps blood clotting?", options: ["A", "C", "D", "K"], correct: 3, explanation: "Vitamin K is essential for prothrombin synthesis." },
  { id: 83, category: "Biology", question: "What is the function of alveoli?", options: ["Digestion", "Filtration", "Gas exchange", "Hormone secretion"], correct: 2, explanation: "Alveoli are tiny air sacs where O2/CO2 exchange occurs." },
  { id: 84, category: "Biology", question: "Which part of the eye controls light entry?", options: ["Cornea", "Iris", "Retina", "Lens"], correct: 1, explanation: "The iris adjusts pupil size to control light." },
  { id: 85, category: "Biology", question: "What type of muscle is the heart?", options: ["Skeletal", "Smooth", "Cardiac", "Voluntary"], correct: 2, explanation: "Cardiac muscle is striated and involuntary." },
  { id: 86, category: "Biology", question: "How many bones are in the adult human body?", options: ["196", "206", "216", "226"], correct: 1, explanation: "Adults have 206 bones." },
  { id: 87, category: "Biology", question: "Which hormone regulates blood sugar?", options: ["Insulin", "Adrenaline", "Thyroxine", "Cortisol"], correct: 0, explanation: "Insulin lowers blood glucose." },
  { id: 88, category: "Biology", question: "What is the most abundant protein in the human body?", options: ["Hemoglobin", "Collagen", "Keratin", "Albumin"], correct: 1, explanation: "Collagen makes up ~30% of total body protein." },
  { id: 89, category: "Biology", question: "Which cell organelle digests waste?", options: ["Ribosome", "Lysosome", "Golgi", "Centriole"], correct: 1, explanation: "Lysosomes contain hydrolytic enzymes." },
  { id: 90, category: "Biology", question: "Where does protein synthesis begin?", options: ["Nucleus", "Ribosome", "Cytoplasm", "Mitochondria"], correct: 0, explanation: "Transcription begins in the nucleus." },
  { id: 91, category: "Biology", question: "What is the genetic material in viruses?", options: ["Only DNA", "Only RNA", "DNA or RNA", "Proteins"], correct: 2, explanation: "Viruses contain either DNA or RNA, not both." },
  { id: 92, category: "Biology", question: "Which organ filters blood and produces urine?", options: ["Liver", "Kidney", "Pancreas", "Spleen"], correct: 1, explanation: "Kidneys filter ~180 L of blood daily." },
  { id: 93, category: "Biology", question: "What is the fluid part of blood?", options: ["Serum", "Plasma", "Lymph", "Synovial fluid"], correct: 1, explanation: "Plasma is ~55% of blood volume." },
  { id: 94, category: "Biology", question: "Which nutrient gives the most energy per gram?", options: ["Carbs", "Proteins", "Fats", "Vitamins"], correct: 2, explanation: "Fats provide ~9 kcal/g." },
  { id: 95, category: "Biology", question: "What is the study of fungi called?", options: ["Botany", "Mycology", "Zoology", "Ecology"], correct: 1, explanation: "Mycology is the branch studying fungi." },
  { id: 96, category: "Biology", question: "Which gland secretes melatonin?", options: ["Pituitary", "Pineal", "Thyroid", "Adrenal"], correct: 1, explanation: "The pineal gland regulates sleep cycles." },
  { id: 97, category: "Biology", question: "Which cells fight infection?", options: ["Red blood cells", "White blood cells", "Platelets", "Plasma cells"], correct: 1, explanation: "Leukocytes are the immune cells." },
  { id: 98, category: "Biology", question: "What is the basic unit of the kidney?", options: ["Neuron", "Nephron", "Alveolus", "Villus"], correct: 1, explanation: "Each kidney has ~1 million nephrons." },
  { id: 99, category: "Biology", question: "Which biome has the highest biodiversity?", options: ["Tundra", "Desert", "Tropical rainforest", "Grassland"], correct: 2, explanation: "Rainforests host over 50% of species." },
  { id: 100, category: "Biology", question: "What is the process of water loss in plants?", options: ["Respiration", "Transpiration", "Translocation", "Guttation"], correct: 1, explanation: "Transpiration occurs through stomata." },
  { id: 101, category: "Biology", question: "Which kingdom includes bacteria?", options: ["Protista", "Fungi", "Monera", "Animalia"], correct: 2, explanation: "Bacteria are prokaryotes in Kingdom Monera." },
  { id: 102, category: "Biology", question: "What is the main function of the large intestine?", options: ["Digestion", "Water absorption", "Enzyme secretion", "Bile production"], correct: 1, explanation: "Large intestine reabsorbs water and forms feces." },
  { id: 103, category: "Biology", question: "Which organelle is in plant cells but not animal?", options: ["Nucleus", "Chloroplast", "Ribosome", "Mitochondria"], correct: 1, explanation: "Chloroplasts perform photosynthesis." },
  { id: 104, category: "Biology", question: "What does ATP stand for?", options: ["Adenosine Triphosphate", "Amino Tri Protein", "Acidic Transport Protein", "Active Transport Protein"], correct: 0, explanation: "ATP is the energy currency of cells." },
  { id: 105, category: "Biology", question: "Which is a sex-linked disorder?", options: ["Diabetes", "Color blindness", "Asthma", "Anemia"], correct: 1, explanation: "Color blindness is X-linked recessive." },
  { id: 106, category: "Biology", question: "What controls the cell?", options: ["Membrane", "Nucleus", "Cytoplasm", "Mitochondria"], correct: 1, explanation: "The nucleus contains DNA and directs activities." },
  { id: 107, category: "Biology", question: "Which animal is a mammal?", options: ["Shark", "Frog", "Whale", "Eagle"], correct: 2, explanation: "Whales are aquatic mammals." },
  { id: 108, category: "Biology", question: "Which phylum includes insects?", options: ["Mollusca", "Arthropoda", "Annelida", "Chordata"], correct: 1, explanation: "Insects belong to phylum Arthropoda." },
  { id: 109, category: "Biology", question: "What is photosynthesis equation product?", options: ["O2 + glucose", "CO2 + water", "ATP only", "Nitrogen + water"], correct: 0, explanation: "6CO2 + 6H2O -> C6H12O6 + 6O2." },
  { id: 110, category: "Biology", question: "Which gas do humans exhale most?", options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], correct: 2, explanation: "Exhaled air contains ~4% CO2." },
  { id: 111, category: "Biology", question: "What part of the brain controls vital functions?", options: ["Cerebrum", "Cerebellum", "Medulla oblongata", "Hypothalamus"], correct: 2, explanation: "Medulla controls breathing and heart rate." },
  { id: 112, category: "Biology", question: "Which vitamin deficiency causes scurvy?", options: ["A", "B12", "C", "D"], correct: 2, explanation: "Vitamin C deficiency leads to scurvy." },
  { id: 113, category: "Biology", question: "What does the liver produce to digest fats?", options: ["Insulin", "Bile", "Saliva", "Pepsin"], correct: 1, explanation: "Bile emulsifies fats in the small intestine." },
  { id: 114, category: "Biology", question: "Which is the smallest blood vessel?", options: ["Artery", "Vein", "Capillary", "Arteriole"], correct: 2, explanation: "Capillaries are 1 cell thick for exchange." },
  { id: 115, category: "Biology", question: "Which disease is caused by Plasmodium?", options: ["Tuberculosis", "Malaria", "Cholera", "Polio"], correct: 1, explanation: "Malaria is spread by Anopheles mosquitoes." },
  { id: 116, category: "Biology", question: "What is the function of platelets?", options: ["Carry oxygen", "Fight infection", "Clot blood", "Make hormones"], correct: 2, explanation: "Platelets initiate blood clotting." },
  { id: 117, category: "Biology", question: "Which is a herbivore?", options: ["Lion", "Cow", "Hawk", "Shark"], correct: 1, explanation: "Cows eat plants exclusively." },
  { id: 118, category: "Biology", question: "What is the powerhouse of plant cells (energy)?", options: ["Chloroplast", "Mitochondria", "Nucleus", "Vacuole"], correct: 1, explanation: "Plants also use mitochondria for ATP." },
  { id: 119, category: "Biology", question: "How many pairs of chromosomes do humans have?", options: ["22", "23", "24", "46"], correct: 1, explanation: "Humans have 23 pairs (46 total)." },
  { id: 120, category: "Biology", question: "Which nutrient builds muscle?", options: ["Carbs", "Fats", "Protein", "Water"], correct: 2, explanation: "Proteins provide amino acids for tissue." },
  { id: 121, category: "Biology", question: "Where does fertilization usually occur in humans?", options: ["Uterus", "Vagina", "Fallopian tube", "Ovary"], correct: 2, explanation: "Sperm meets egg in the fallopian tube." },
  { id: 122, category: "Biology", question: "What organism causes athlete's foot?", options: ["Bacteria", "Virus", "Fungus", "Protozoa"], correct: 2, explanation: "Athlete's foot is a fungal infection." },
  { id: 123, category: "Biology", question: "Which vessel carries oxygen-rich blood from lungs?", options: ["Pulmonary artery", "Pulmonary vein", "Aorta", "Vena cava"], correct: 1, explanation: "Pulmonary veins carry oxygenated blood to the heart." },
  { id: 124, category: "Biology", question: "What is symbiosis where both benefit?", options: ["Parasitism", "Commensalism", "Mutualism", "Competition"], correct: 2, explanation: "Mutualism benefits both organisms." },
  { id: 125, category: "Biology", question: "Which trophic level has most energy?", options: ["Producers", "Primary consumers", "Secondary consumers", "Decomposers"], correct: 0, explanation: "Energy decreases up trophic levels (10% rule)." },
  { id: 126, category: "Biology", question: "What gives bones their hardness?", options: ["Calcium phosphate", "Iron", "Magnesium", "Sodium"], correct: 0, explanation: "Hydroxyapatite (calcium phosphate) hardens bone." },
  { id: 127, category: "Biology", question: "Which type of immunity is from vaccination?", options: ["Innate", "Active", "Passive", "Natural passive"], correct: 1, explanation: "Vaccines induce active immunity." },
  { id: 128, category: "Biology", question: "What is the largest cell in the human body?", options: ["Neuron", "Egg cell", "Muscle cell", "Liver cell"], correct: 1, explanation: "The ovum is ~0.1 mm \u2014 visible to the eye." },
  { id: 129, category: "Biology", question: "Which organ stores bile?", options: ["Liver", "Gallbladder", "Pancreas", "Kidney"], correct: 1, explanation: "The gallbladder concentrates and stores bile." },
  { id: 130, category: "Biology", question: "What is biodiversity?", options: ["Number of cells", "Variety of life", "Number of habitats", "Population density"], correct: 1, explanation: "Biodiversity is variety of species in an area." },
  { id: 131, category: "Biology", question: "Which type of reproduction needs only one parent?", options: ["Sexual", "Asexual", "Cross", "Hybrid"], correct: 1, explanation: "Asexual reproduction needs no mate." },
  { id: 132, category: "Biology", question: "What type of bond holds DNA strands together?", options: ["Ionic", "Covalent", "Hydrogen", "Metallic"], correct: 2, explanation: "Hydrogen bonds between base pairs." },
  { id: 133, category: "Biology", question: "Which structure is found in bacterial cells only?", options: ["Cell wall", "Ribosome", "Pili", "Mitochondria"], correct: 2, explanation: "Pili help bacterial conjugation." },
  { id: 134, category: "Biology", question: "What is the deepest layer of skin?", options: ["Epidermis", "Dermis", "Hypodermis", "Stratum corneum"], correct: 2, explanation: "Hypodermis (subcutaneous) is deepest." },
  { id: 135, category: "Biology", question: "Which sense does the cochlea serve?", options: ["Sight", "Hearing", "Smell", "Taste"], correct: 1, explanation: "Cochlea converts sound to nerve signals." },
  { id: 136, category: "Biology", question: "Which animal is cold-blooded?", options: ["Dog", "Reptile", "Bird", "Mammal"], correct: 1, explanation: "Reptiles are ectothermic." },
  { id: 137, category: "Biology", question: "What is the function of the cerebrum?", options: ["Balance", "Reflex", "Thinking", "Breathing"], correct: 2, explanation: "Cerebrum handles thought, memory, voluntary action." },
  { id: 138, category: "Biology", question: "Which substance makes urine yellow?", options: ["Bilirubin", "Urochrome", "Hemoglobin", "Glucose"], correct: 1, explanation: "Urochrome is the urine pigment." },
  { id: 139, category: "Biology", question: "Which structure is unique to plant cells?", options: ["Mitochondria", "Cell wall", "Ribosome", "Nucleus"], correct: 1, explanation: "Plant cell walls are made of cellulose." },
  { id: 140, category: "Biology", question: "Which scientist discovered penicillin?", options: ["Pasteur", "Koch", "Fleming", "Salk"], correct: 2, explanation: "Alexander Fleming discovered penicillin in 1928." },
  { id: 141, category: "Biology", question: "What is the largest artery?", options: ["Pulmonary", "Aorta", "Carotid", "Femoral"], correct: 1, explanation: "The aorta is the largest artery." },
  { id: 142, category: "Biology", question: "Which of these is a decomposer?", options: ["Tiger", "Mushroom", "Rabbit", "Hawk"], correct: 1, explanation: "Fungi decompose organic matter." },
  { id: 143, category: "Biology", question: "Which type of cell division produces 4 daughter cells?", options: ["Mitosis", "Meiosis", "Binary fission", "Budding"], correct: 1, explanation: "Meiosis produces 4 haploid gametes." },
  { id: 144, category: "Biology", question: "What is the average human body temperature?", options: ["35\u00b0C", "36\u00b0C", "37\u00b0C", "38\u00b0C"], correct: 2, explanation: "Normal core temperature is ~37\u00b0C." },
  { id: 145, category: "Biology", question: "Which plant tissue transports water?", options: ["Phloem", "Xylem", "Cambium", "Cortex"], correct: 1, explanation: "Xylem transports water and minerals upward." },
  { id: 146, category: "Biology", question: "Which gas is produced in fermentation by yeast?", options: ["O2", "N2", "CO2", "H2"], correct: 2, explanation: "Yeast produces ethanol and CO2." },
  { id: 147, category: "Biology", question: "What is the function of root hairs?", options: ["Photosynthesis", "Anchorage", "Water absorption", "Reproduction"], correct: 2, explanation: "Root hairs increase surface area for absorption." },
  { id: 148, category: "Biology", question: "Which class includes humans?", options: ["Reptilia", "Aves", "Mammalia", "Amphibia"], correct: 2, explanation: "Humans are mammals." },
  { id: 149, category: "Biology", question: "What is the most common blood type?", options: ["A", "B", "AB", "O"], correct: 3, explanation: "O is the most common globally." },
  { id: 150, category: "Biology", question: "Which structure protects the brain?", options: ["Skin", "Skull", "Spine", "Ribs"], correct: 1, explanation: "The cranium (skull) encases the brain." },
  { id: 151, category: "Chemistry", question: "What is the chemical symbol for gold?", options: ["Go", "Gd", "Au", "Ag"], correct: 2, explanation: "Au from Latin 'aurum'." },
  { id: 152, category: "Chemistry", question: "What is the chemical symbol for sodium?", options: ["S", "So", "Na", "N"], correct: 2, explanation: "Na from Latin 'natrium'." },
  { id: 153, category: "Chemistry", question: "Which element has the symbol K?", options: ["Krypton", "Potassium", "Calcium", "Carbon"], correct: 1, explanation: "K from Latin 'kalium'." },
  { id: 154, category: "Chemistry", question: "What is the most abundant gas in Earth's atmosphere?", options: ["O2", "N2", "CO2", "Ar"], correct: 1, explanation: "Nitrogen makes ~78%." },
  { id: 155, category: "Chemistry", question: "What is the main component of natural gas?", options: ["Ethane", "Methane", "Propane", "Butane"], correct: 1, explanation: "Methane (CH4) is ~90% of natural gas." },
  { id: 156, category: "Chemistry", question: "Which acid is in lemons?", options: ["Acetic", "Citric", "Lactic", "Malic"], correct: 1, explanation: "Citric acid gives lemons their sour taste." },
  { id: 157, category: "Chemistry", question: "What is the pH of pure water?", options: ["5", "6", "7", "8"], correct: 2, explanation: "Pure water is neutral at pH 7." },
  { id: 158, category: "Chemistry", question: "Which element is liquid at room temperature?", options: ["Iron", "Mercury", "Sodium", "Aluminum"], correct: 1, explanation: "Mercury melts at -38.8\u00b0C." },
  { id: 159, category: "Chemistry", question: "What is the formula of carbon dioxide?", options: ["CO", "CO2", "C2O", "CO3"], correct: 1, explanation: "Carbon dioxide is CO2." },
  { id: 160, category: "Chemistry", question: "How many protons does hydrogen have?", options: ["0", "1", "2", "3"], correct: 1, explanation: "Hydrogen atomic number is 1." },
  { id: 161, category: "Chemistry", question: "What type of reaction is rusting?", options: ["Reduction", "Oxidation", "Neutralization", "Combustion"], correct: 1, explanation: "Iron is oxidized to Fe2O3." },
  { id: 162, category: "Chemistry", question: "Which gas turns lime water milky?", options: ["O2", "N2", "CO2", "H2"], correct: 2, explanation: "CO2 forms calcium carbonate precipitate." },
  { id: 163, category: "Chemistry", question: "What is an alloy?", options: ["Pure metal", "Mixture of metals", "Compound", "Element"], correct: 1, explanation: "Alloys are metallic mixtures (e.g., brass)." },
  { id: 164, category: "Chemistry", question: "Which is a strong acid?", options: ["Acetic", "Citric", "Hydrochloric", "Carbonic"], correct: 2, explanation: "HCl fully dissociates in water." },
  { id: 165, category: "Chemistry", question: "What is the molar mass of water?", options: ["16 g/mol", "18 g/mol", "20 g/mol", "32 g/mol"], correct: 1, explanation: "H2O = 2(1) + 16 = 18 g/mol." },
  { id: 166, category: "Chemistry", question: "Which subatomic particle has no charge?", options: ["Proton", "Electron", "Neutron", "Positron"], correct: 2, explanation: "Neutrons are electrically neutral." },
  { id: 167, category: "Chemistry", question: "What is the formula for ammonia?", options: ["NH", "NH2", "NH3", "NH4"], correct: 2, explanation: "Ammonia is NH3." },
  { id: 168, category: "Chemistry", question: "Which group of the periodic table contains alkali metals?", options: ["1", "2", "17", "18"], correct: 0, explanation: "Group 1: Li, Na, K, Rb, Cs, Fr." },
  { id: 169, category: "Chemistry", question: "What is the chemical formula of table salt?", options: ["NaCl", "KCl", "CaCl2", "NaF"], correct: 0, explanation: "Sodium chloride is NaCl." },
  { id: 170, category: "Chemistry", question: "Which gas is used in balloons (lighter than air)?", options: ["Oxygen", "Helium", "Nitrogen", "Argon"], correct: 1, explanation: "Helium is inert and lighter than air." },
  { id: 171, category: "Chemistry", question: "What is the SI unit of amount of substance?", options: ["Gram", "Mole", "Liter", "Kelvin"], correct: 1, explanation: "The mole (mol) is the SI unit." },
  { id: 172, category: "Chemistry", question: "Which element has atomic number 8?", options: ["Nitrogen", "Oxygen", "Fluorine", "Neon"], correct: 1, explanation: "Oxygen has 8 protons." },
  { id: 173, category: "Chemistry", question: "What is a saturated solution?", options: ["Below max solute", "Maximum solute dissolved", "No solute", "Boiling solution"], correct: 1, explanation: "Saturated holds max solute at given temperature." },
  { id: 174, category: "Chemistry", question: "Which is an organic compound?", options: ["NaCl", "CH4", "H2O", "NH3"], correct: 1, explanation: "Organic compounds contain C-H bonds." },
  { id: 175, category: "Chemistry", question: "What is the process of solid to gas?", options: ["Melting", "Freezing", "Sublimation", "Condensation"], correct: 2, explanation: "Sublimation skips the liquid phase (e.g., dry ice)." },
  { id: 176, category: "Chemistry", question: "Which solution is basic?", options: ["Lemon juice", "Vinegar", "Soap", "Coffee"], correct: 2, explanation: "Soap has pH ~9-10." },
  { id: 177, category: "Chemistry", question: "What is Brownian motion?", options: ["Light bending", "Random particle motion", "Boiling", "Crystallization"], correct: 1, explanation: "Random motion of particles in a fluid." },
  { id: 178, category: "Chemistry", question: "Which is a noble gas?", options: ["O2", "N2", "Ne", "CO2"], correct: 2, explanation: "Neon is in Group 18." },
  { id: 179, category: "Chemistry", question: "What is electrolysis?", options: ["Heating", "Decomposition by current", "Mixing", "Filtering"], correct: 1, explanation: "Electric current splits a compound." },
  { id: 180, category: "Chemistry", question: "What is hard water rich in?", options: ["Sodium", "Calcium and magnesium", "Potassium", "Iron"], correct: 1, explanation: "Ca2+ and Mg2+ ions cause hardness." },
  { id: 181, category: "Chemistry", question: "Which element is most abundant in the universe?", options: ["Hydrogen", "Helium", "Carbon", "Oxygen"], correct: 0, explanation: "Hydrogen is ~75% of normal matter." },
  { id: 182, category: "Chemistry", question: "Which acid is used in car batteries?", options: ["HCl", "H2SO4", "HNO3", "CH3COOH"], correct: 1, explanation: "Sulfuric acid (H2SO4) is the electrolyte." },
  { id: 183, category: "Chemistry", question: "What does 'isotope' mean?", options: ["Same protons, different neutrons", "Different elements", "Same neutrons", "Charged atoms"], correct: 0, explanation: "Isotopes share atomic number but differ in mass." },
  { id: 184, category: "Chemistry", question: "Which gas is needed for combustion?", options: ["N2", "CO2", "O2", "H2"], correct: 2, explanation: "Oxygen supports combustion." },
  { id: 185, category: "Chemistry", question: "What is the name of CaCO3?", options: ["Calcium oxide", "Calcium hydroxide", "Calcium carbonate", "Calcium chloride"], correct: 2, explanation: "CaCO3 is calcium carbonate (limestone)." },
  { id: 186, category: "Chemistry", question: "Which is the hardest natural substance?", options: ["Iron", "Diamond", "Gold", "Quartz"], correct: 1, explanation: "Diamond is the hardest known mineral." },
  { id: 187, category: "Chemistry", question: "What state of matter has fixed volume but no fixed shape?", options: ["Solid", "Liquid", "Gas", "Plasma"], correct: 1, explanation: "Liquids take container shape." },
  { id: 188, category: "Chemistry", question: "Which compound is responsible for ozone layer?", options: ["O", "O2", "O3", "CO2"], correct: 2, explanation: "Ozone is O3." },
  { id: 189, category: "Chemistry", question: "What is the formula of sulfuric acid?", options: ["HCl", "H2SO4", "HNO3", "H3PO4"], correct: 1, explanation: "H2SO4." },
  { id: 190, category: "Chemistry", question: "Which type of bond forms NaCl?", options: ["Covalent", "Ionic", "Metallic", "Hydrogen"], correct: 1, explanation: "Na+ and Cl- bond ionically." },
  { id: 191, category: "Chemistry", question: "What does pH measure?", options: ["Pressure", "Hydrogen ion concentration", "Heat", "Density"], correct: 1, explanation: "pH = -log[H+]." },
  { id: 192, category: "Chemistry", question: "Which metal is liquid?", options: ["Sodium", "Mercury", "Aluminum", "Copper"], correct: 1, explanation: "Mercury at room temperature." },
  { id: 193, category: "Chemistry", question: "What is the lightest noble gas?", options: ["He", "Ne", "Ar", "Kr"], correct: 0, explanation: "Helium has atomic mass ~4." },
  { id: 194, category: "Chemistry", question: "Which element makes up most of the human body?", options: ["Carbon", "Oxygen", "Hydrogen", "Nitrogen"], correct: 1, explanation: "Oxygen is ~65% by mass (water)." },
  { id: 195, category: "Chemistry", question: "What is the chemical symbol for silver?", options: ["Si", "Sl", "Ag", "Au"], correct: 2, explanation: "Ag from Latin 'argentum'." },
  { id: 196, category: "Chemistry", question: "Which gas smells like rotten eggs?", options: ["NH3", "SO2", "H2S", "CH4"], correct: 2, explanation: "Hydrogen sulfide (H2S)." },
  { id: 197, category: "Chemistry", question: "What is the percentage of oxygen in air?", options: ["10%", "21%", "50%", "78%"], correct: 1, explanation: "Air is ~21% O2." },
  { id: 198, category: "Chemistry", question: "What is a polymer?", options: ["Single molecule", "Long chain of monomers", "Atom", "Element"], correct: 1, explanation: "Polymers are repeating monomer chains." },
  { id: 199, category: "Chemistry", question: "Which metal is used in thermometers?", options: ["Iron", "Mercury", "Aluminum", "Lead"], correct: 1, explanation: "Mercury expands uniformly with heat." },
  { id: 200, category: "Chemistry", question: "What is dry ice?", options: ["Frozen water", "Frozen CO2", "Frozen N2", "Frozen ammonia"], correct: 1, explanation: "Dry ice is solid CO2." },
  { id: 201, category: "Chemistry", question: "Which acid is in vinegar?", options: ["Citric", "Acetic", "Lactic", "Malic"], correct: 1, explanation: "Acetic acid (CH3COOH)." },
  { id: 202, category: "Chemistry", question: "What is the chemical formula of methane?", options: ["CH3", "CH4", "C2H6", "CH"], correct: 1, explanation: "Methane is CH4." },
  { id: 203, category: "Chemistry", question: "Which is the most reactive metal?", options: ["Sodium", "Iron", "Gold", "Copper"], correct: 0, explanation: "Sodium reacts violently with water." },
  { id: 204, category: "Chemistry", question: "Who proposed the modern atomic theory?", options: ["Bohr", "Dalton", "Rutherford", "Thomson"], correct: 1, explanation: "John Dalton (1808) proposed atomic theory." },
  { id: 205, category: "Chemistry", question: "Which compound is responsible for greenhouse effect?", options: ["O2", "N2", "CO2", "Ar"], correct: 2, explanation: "CO2 traps infrared radiation." },
  { id: 206, category: "Chemistry", question: "What is the unit of pressure?", options: ["Newton", "Pascal", "Joule", "Watt"], correct: 1, explanation: "Pascal (Pa) = N/m\u00b2." },
  { id: 207, category: "Chemistry", question: "Which is a halogen?", options: ["Sodium", "Chlorine", "Argon", "Calcium"], correct: 1, explanation: "Chlorine is in Group 17 (halogens)." },
  { id: 208, category: "Chemistry", question: "What is the name of NaOH?", options: ["Sodium chloride", "Sodium hydroxide", "Sodium oxide", "Sodium carbonate"], correct: 1, explanation: "NaOH is caustic soda." },
  { id: 209, category: "Chemistry", question: "Which is a covalent compound?", options: ["NaCl", "H2O", "KBr", "CaO"], correct: 1, explanation: "Water has covalent O-H bonds." },
  { id: 210, category: "Chemistry", question: "What is the boiling point of water at sea level?", options: ["90\u00b0C", "100\u00b0C", "110\u00b0C", "120\u00b0C"], correct: 1, explanation: "Water boils at 100\u00b0C at 1 atm." },
  { id: 211, category: "Chemistry", question: "Which has the highest density?", options: ["Iron", "Lead", "Gold", "Mercury"], correct: 2, explanation: "Gold density is ~19.3 g/cm\u00b3." },
  { id: 212, category: "Chemistry", question: "What is a cation?", options: ["Positive ion", "Negative ion", "Neutral", "Atom"], correct: 0, explanation: "Cations have lost electrons." },
  { id: 213, category: "Chemistry", question: "What is ozone (O3) used for?", options: ["Cooking", "UV protection", "Cleaning", "Painting"], correct: 1, explanation: "Ozone absorbs harmful UV radiation." },
  { id: 214, category: "Chemistry", question: "Which gas extinguishes fire?", options: ["O2", "CO2", "H2", "CH4"], correct: 1, explanation: "CO2 displaces oxygen." },
  { id: 215, category: "Chemistry", question: "What is the most electronegative element?", options: ["O", "N", "F", "Cl"], correct: 2, explanation: "Fluorine: 3.98 on Pauling scale." },
  { id: 216, category: "Chemistry", question: "What is the formula of glucose?", options: ["C6H12O6", "C12H22O11", "C2H6O", "CH4"], correct: 0, explanation: "Glucose: C6H12O6." },
  { id: 217, category: "Chemistry", question: "Which orbital fills first?", options: ["1s", "2s", "2p", "3s"], correct: 0, explanation: "Aufbau principle: 1s first." },
  { id: 218, category: "Chemistry", question: "What is the SI unit of temperature?", options: ["Celsius", "Fahrenheit", "Kelvin", "Rankine"], correct: 2, explanation: "Kelvin (K) is the SI unit." },
  { id: 219, category: "Chemistry", question: "Which element is brown liquid at room temperature?", options: ["Br", "Hg", "Fe", "Cl"], correct: 0, explanation: "Bromine is a red-brown liquid." },
  { id: 220, category: "Chemistry", question: "What is an exothermic reaction?", options: ["Absorbs heat", "Releases heat", "Releases gas", "Absorbs light"], correct: 1, explanation: "Exothermic reactions release heat." },
  { id: 221, category: "Chemistry", question: "Which compound is responsible for soap?", options: ["Acid", "Base", "Salt of fatty acid", "Alcohol"], correct: 2, explanation: "Soap = sodium/potassium salt of fatty acids." },
  { id: 222, category: "Chemistry", question: "Which element symbol is Sn?", options: ["Silicon", "Sodium", "Tin", "Strontium"], correct: 2, explanation: "Sn from Latin 'stannum'." },
  { id: 223, category: "Chemistry", question: "What is the chemical name of vinegar?", options: ["HCl", "Acetic acid", "Citric acid", "Lactic acid"], correct: 1, explanation: "Vinegar is dilute acetic acid." },
  { id: 224, category: "Chemistry", question: "What is alloy of iron and carbon?", options: ["Brass", "Bronze", "Steel", "Pewter"], correct: 2, explanation: "Steel is Fe + ~0.2-2% C." },
  { id: 225, category: "Chemistry", question: "Which planet's atmosphere is mostly CO2?", options: ["Earth", "Venus", "Mars", "Both Venus and Mars"], correct: 3, explanation: "Venus and Mars are >95% CO2." },
  { id: 226, category: "Chemistry", question: "What is fermentation?", options: ["Aerobic respiration", "Anaerobic breakdown of sugar", "Photosynthesis", "Distillation"], correct: 1, explanation: "Fermentation produces ethanol/CO2 anaerobically." },
  { id: 227, category: "Chemistry", question: "Which gas causes acid rain?", options: ["O2", "SO2", "CO2", "N2"], correct: 1, explanation: "SO2 + NOx form sulfuric/nitric acids." },
  { id: 228, category: "Chemistry", question: "Which is the lightest element?", options: ["Helium", "Hydrogen", "Lithium", "Carbon"], correct: 1, explanation: "Hydrogen is the lightest." },
  { id: 229, category: "Chemistry", question: "What does an indicator show?", options: ["Heat", "pH", "Pressure", "Mass"], correct: 1, explanation: "Indicators change color with pH." },
  { id: 230, category: "Chemistry", question: "Which acid digests food in stomach?", options: ["HCl", "H2SO4", "HNO3", "H3PO4"], correct: 0, explanation: "Stomach pH is ~1-2 (HCl)." },
  { id: 231, category: "Chemistry", question: "What is the unit of electric charge?", options: ["Volt", "Ohm", "Coulomb", "Ampere"], correct: 2, explanation: "Coulomb (C) measures charge." },
  { id: 232, category: "Chemistry", question: "Which compound is salt?", options: ["NaCl", "HCl", "NaOH", "H2O"], correct: 0, explanation: "NaCl is common table salt." },
  { id: 233, category: "Chemistry", question: "Which element burns with brick-red flame?", options: ["Sodium", "Calcium", "Potassium", "Copper"], correct: 1, explanation: "Calcium burns brick-red in flame test." },
  { id: 234, category: "Chemistry", question: "What is the most common state of matter in the universe?", options: ["Solid", "Liquid", "Gas", "Plasma"], correct: 3, explanation: "Plasma (stars) makes up ~99% of visible matter." },
  { id: 235, category: "Physics", question: "Which scientist formulated the laws of motion?", options: ["Einstein", "Newton", "Galileo", "Tesla"], correct: 1, explanation: "Sir Isaac Newton (1687)." },
  { id: 236, category: "Physics", question: "What is the SI unit of work?", options: ["Watt", "Joule", "Newton", "Pascal"], correct: 1, explanation: "Joule (J) = N\u00b7m." },
  { id: 237, category: "Physics", question: "What is the SI unit of power?", options: ["Joule", "Watt", "Volt", "Ampere"], correct: 1, explanation: "Watt (W) = J/s." },
  { id: 238, category: "Physics", question: "Which law explains 'opposite poles attract'?", options: ["Newton's", "Coulomb's", "Ohm's", "Faraday's"], correct: 1, explanation: "Coulomb's law for electric charges; analogous for magnets." },
  { id: 239, category: "Physics", question: "What is the unit of energy?", options: ["Newton", "Joule", "Pascal", "Hertz"], correct: 1, explanation: "Joule is the SI unit of energy." },
  { id: 240, category: "Physics", question: "What is the speed of sound in air?", options: ["340 m/s", "3\u00d710\u2078 m/s", "150 m/s", "1500 m/s"], correct: 0, explanation: "About 343 m/s at 20\u00b0C." },
  { id: 241, category: "Physics", question: "What does 'g' represent?", options: ["Gravity acceleration", "Mass", "Force", "Friction"], correct: 0, explanation: "g = 9.8 m/s\u00b2 on Earth." },
  { id: 242, category: "Physics", question: "Which simple machine is a ramp?", options: ["Lever", "Pulley", "Inclined plane", "Wedge"], correct: 2, explanation: "An inclined plane reduces force needed." },
  { id: 243, category: "Physics", question: "Which color has the shortest wavelength?", options: ["Red", "Yellow", "Blue", "Violet"], correct: 3, explanation: "Violet ~400 nm." },
  { id: 244, category: "Physics", question: "What is the law of conservation of energy?", options: ["Energy is created", "Energy is destroyed", "Energy is conserved", "Energy is mass"], correct: 2, explanation: "Energy can change form but not be destroyed." },
  { id: 245, category: "Physics", question: "What does a voltmeter measure?", options: ["Current", "Voltage", "Resistance", "Power"], correct: 1, explanation: "Voltmeters measure potential difference." },
  { id: 246, category: "Physics", question: "Which type of lens converges light?", options: ["Concave", "Convex", "Plane", "Cylindrical"], correct: 1, explanation: "Convex lenses converge parallel rays." },
  { id: 247, category: "Physics", question: "What is inertia?", options: ["Resistance to motion change", "Force", "Speed", "Mass"], correct: 0, explanation: "Inertia is the tendency to resist change in motion." },
  { id: 248, category: "Physics", question: "Which has more inertia: a truck or a bicycle?", options: ["Bicycle", "Truck", "Same", "Depends"], correct: 1, explanation: "More mass means more inertia." },
  { id: 249, category: "Physics", question: "Which device converts mechanical to electrical energy?", options: ["Motor", "Generator", "Transformer", "Battery"], correct: 1, explanation: "Generators use electromagnetic induction." },
  { id: 250, category: "Physics", question: "What is friction?", options: ["Force opposing motion", "Force causing motion", "Gravity", "Pressure"], correct: 0, explanation: "Friction opposes relative motion." },
  { id: 251, category: "Physics", question: "Which force keeps planets in orbit?", options: ["Friction", "Magnetism", "Gravity", "Tension"], correct: 2, explanation: "Gravity provides centripetal force." },
  { id: 252, category: "Physics", question: "What is acceleration?", options: ["Speed", "Velocity change rate", "Distance", "Mass"], correct: 1, explanation: "a = \u0394v/\u0394t." },
  { id: 253, category: "Physics", question: "Which instrument measures earthquakes?", options: ["Barometer", "Seismograph", "Anemometer", "Hygrometer"], correct: 1, explanation: "Seismographs record seismic waves." },
  { id: 254, category: "Physics", question: "Which type of energy is stored in a stretched spring?", options: ["Kinetic", "Elastic potential", "Thermal", "Chemical"], correct: 1, explanation: "Elastic PE = \u00bdkx\u00b2." },
  { id: 255, category: "Physics", question: "Which mirror is used in vehicles for rear view?", options: ["Concave", "Convex", "Plane", "Spherical"], correct: 1, explanation: "Convex mirrors give wider view." },
  { id: 256, category: "Physics", question: "Which planet has strongest gravity?", options: ["Earth", "Jupiter", "Saturn", "Neptune"], correct: 1, explanation: "Jupiter's gravity is ~24.79 m/s\u00b2." },
  { id: 257, category: "Physics", question: "What is buoyancy?", options: ["Upward force in fluid", "Downward gravity", "Friction", "Pressure"], correct: 0, explanation: "Buoyancy = weight of fluid displaced." },
  { id: 258, category: "Physics", question: "What is the unit of magnetic flux?", options: ["Tesla", "Weber", "Henry", "Gauss"], correct: 1, explanation: "Weber (Wb)." },
  { id: 259, category: "Physics", question: "What is the focal length of a plane mirror?", options: ["0", "1", "Infinity", "Variable"], correct: 2, explanation: "Plane mirrors have infinite focal length." },
  { id: 260, category: "Physics", question: "Who discovered electromagnetic induction?", options: ["Newton", "Faraday", "Maxwell", "Tesla"], correct: 1, explanation: "Michael Faraday in 1831." },
  { id: 261, category: "Physics", question: "Which radiation has the highest frequency?", options: ["Radio", "Microwave", "Visible", "Gamma"], correct: 3, explanation: "Gamma rays have shortest wavelength." },
  { id: 262, category: "Physics", question: "What is the formula for momentum?", options: ["mv", "ma", "mgh", "\u00bdmv\u00b2"], correct: 0, explanation: "p = mv." },
  { id: 263, category: "Physics", question: "Which law states force = mass \u00d7 acceleration?", options: ["1st", "2nd", "3rd", "Conservation"], correct: 1, explanation: "Newton's 2nd Law: F = ma." },
  { id: 264, category: "Physics", question: "What does an ammeter measure?", options: ["Voltage", "Current", "Resistance", "Power"], correct: 1, explanation: "Ammeters measure current in amperes." },
  { id: 265, category: "Physics", question: "Which is a vector quantity?", options: ["Speed", "Mass", "Velocity", "Time"], correct: 2, explanation: "Velocity has magnitude AND direction." },
  { id: 266, category: "Physics", question: "What happens to current if voltage doubles (R constant)?", options: ["Halves", "Doubles", "Stays", "Quadruples"], correct: 1, explanation: "I = V/R; I doubles." },
  { id: 267, category: "Physics", question: "What is the unit of capacitance?", options: ["Volt", "Ohm", "Farad", "Henry"], correct: 2, explanation: "Farad (F) is the SI unit." },
  { id: 268, category: "Physics", question: "Which scientist explained gravity using spacetime?", options: ["Newton", "Einstein", "Hawking", "Bohr"], correct: 1, explanation: "Einstein's General Relativity." },
  { id: 269, category: "Physics", question: "What is centripetal force?", options: ["Outward", "Inward toward center", "Tangential", "Vertical"], correct: 1, explanation: "Centripetal force points to circle center." },
  { id: 270, category: "Physics", question: "Which type of wave needs a medium?", options: ["Electromagnetic", "Light", "Mechanical", "Radio"], correct: 2, explanation: "Mechanical waves (sound) need a medium." },
  { id: 271, category: "Physics", question: "What is the SI unit of angle?", options: ["Degree", "Radian", "Steradian", "Grade"], correct: 1, explanation: "Radian is the SI unit." },
  { id: 272, category: "Physics", question: "What is total internal reflection?", options: ["Light bouncing inside dense medium", "Light passing", "Light absorbing", "Light scattering"], correct: 0, explanation: "Occurs above the critical angle." },
  { id: 273, category: "Physics", question: "Which is heaviest subatomic particle?", options: ["Electron", "Proton", "Neutron", "Photon"], correct: 2, explanation: "Neutrons are slightly heavier than protons." },
  { id: 274, category: "Physics", question: "What is Hooke's law?", options: ["F = kx", "E = mc\u00b2", "V = IR", "p = mv"], correct: 0, explanation: "Force in spring is proportional to extension." },
  { id: 275, category: "Physics", question: "Which unit is used for sound intensity?", options: ["Hertz", "Decibel", "Watt", "Newton"], correct: 1, explanation: "Decibel (dB) measures sound level." },
  { id: 276, category: "Physics", question: "What is the principle of a hydraulic press?", options: ["Newton's 3rd", "Pascal's", "Bernoulli's", "Archimedes'"], correct: 1, explanation: "Pressure is transmitted equally in fluids." },
  { id: 277, category: "Physics", question: "Which type of mirror forms real images?", options: ["Plane", "Convex", "Concave", "All"], correct: 2, explanation: "Concave mirrors form real images beyond focal point." },
  { id: 278, category: "Physics", question: "What is the unit of magnetic field strength?", options: ["Tesla", "Weber", "Henry", "Gauss"], correct: 0, explanation: "Tesla (T) is the SI unit." },
  { id: 279, category: "Physics", question: "Which has more energy: red or blue light?", options: ["Red", "Blue", "Same", "Depends"], correct: 1, explanation: "Higher frequency = more energy. E = hf." },
  { id: 280, category: "Physics", question: "Which device steps up or down AC voltage?", options: ["Generator", "Motor", "Transformer", "Capacitor"], correct: 2, explanation: "Transformers use mutual induction." },
  { id: 281, category: "Physics", question: "Which radiation is used in MRI?", options: ["X-rays", "Radio waves", "Gamma", "UV"], correct: 1, explanation: "MRI uses radio frequency in magnetic field." },
  { id: 282, category: "Physics", question: "What is escape velocity from Earth?", options: ["7.9 km/s", "11.2 km/s", "20 km/s", "100 km/s"], correct: 1, explanation: "11.2 km/s to leave Earth's gravity." },
  { id: 283, category: "Physics", question: "Which type of energy fission produces?", options: ["Chemical", "Mechanical", "Nuclear", "Solar"], correct: 2, explanation: "Fission splits atoms releasing nuclear energy." },
  { id: 284, category: "Physics", question: "What does CFC stand for?", options: ["Carbon Fluorine Compound", "Chlorofluorocarbon", "Carbon Free Carbon", "Cool Fast Compound"], correct: 1, explanation: "CFCs deplete ozone layer." },
  { id: 285, category: "Physics", question: "Which is correct unit for resistance?", options: ["Volt", "Ampere", "Ohm", "Watt"], correct: 2, explanation: "Ohm (\u03a9)." },
  { id: 286, category: "Physics", question: "What does the Doppler effect describe?", options: ["Light bending", "Frequency change with motion", "Heat transfer", "Mass change"], correct: 1, explanation: "Frequency shifts with source/observer motion." },
  { id: 287, category: "Physics", question: "Which energy is in moving water?", options: ["Potential", "Kinetic", "Chemical", "Nuclear"], correct: 1, explanation: "Moving water has KE; used in hydropower." },
  { id: 288, category: "Physics", question: "Which is the SI base unit of length?", options: ["Inch", "Meter", "Centimeter", "Foot"], correct: 1, explanation: "Meter (m)." },
  { id: 289, category: "Physics", question: "What is one horsepower?", options: ["546 W", "746 W", "946 W", "1000 W"], correct: 1, explanation: "1 hp \u2248 746 watts." },
  { id: 290, category: "Physics", question: "Which phenomenon causes mirages?", options: ["Reflection", "Refraction", "Diffraction", "Absorption"], correct: 1, explanation: "Hot air bends light upward." },
  { id: 291, category: "Physics", question: "Who invented the radio?", options: ["Edison", "Marconi", "Bell", "Tesla"], correct: 1, explanation: "Guglielmo Marconi (1895)." },
  { id: 292, category: "Physics", question: "Which color absorbs the most heat?", options: ["White", "Red", "Blue", "Black"], correct: 3, explanation: "Black absorbs all visible light." },
  { id: 293, category: "Physics", question: "What is alternating current?", options: ["One direction", "Reverses direction", "Constant", "Pulsed"], correct: 1, explanation: "AC reverses periodically." },
  { id: 294, category: "Physics", question: "What is the speed of light in m/s?", options: ["3\u00d710\u2075", "3\u00d710\u2076", "3\u00d710\u2078", "3\u00d710\u00b9\u2070"], correct: 2, explanation: "c \u2248 3\u00d710\u2078 m/s." },
  { id: 295, category: "Physics", question: "What is wavelength?", options: ["Distance between crests", "Number of waves", "Speed", "Energy"], correct: 0, explanation: "Wavelength is one full wave cycle distance." },
  { id: 296, category: "Physics", question: "Which is a longitudinal wave?", options: ["Light", "Water", "Sound", "Radio"], correct: 2, explanation: "Sound waves are compressional." },
  { id: 297, category: "Physics", question: "Which device measures temperature?", options: ["Manometer", "Thermometer", "Galvanometer", "Voltmeter"], correct: 1, explanation: "Thermometers measure temperature." },
  { id: 298, category: "Physics", question: "What is the unit of frequency?", options: ["Newton", "Pascal", "Hertz", "Watt"], correct: 2, explanation: "Hertz (Hz) = cycles/second." },
  { id: 299, category: "Physics", question: "Which device stores electric charge?", options: ["Resistor", "Capacitor", "Inductor", "Diode"], correct: 1, explanation: "Capacitors store energy in electric fields." },
  { id: 300, category: "Physics", question: "Which color of light bends most through prism?", options: ["Red", "Green", "Violet", "Yellow"], correct: 2, explanation: "Violet has shortest wavelength, bends most." },
  { id: 301, category: "Physics", question: "What is half-life?", options: ["Time for half decay", "Total time", "Energy", "Mass"], correct: 0, explanation: "Time for half of nuclei to decay." },
  { id: 302, category: "Physics", question: "Which has more potential energy: object on hill or valley?", options: ["Hill", "Valley", "Same", "Depends"], correct: 0, explanation: "PE = mgh; higher h means more PE." },
  { id: 303, category: "Physics", question: "Which gas is used in light bulbs (incandescent)?", options: ["O2", "Argon", "Helium", "CO2"], correct: 1, explanation: "Argon prevents filament oxidation." },
  { id: 304, category: "Physics", question: "What does 'magnitude 7 earthquake' refer to?", options: ["Energy on Richter", "Time", "Depth", "Pressure"], correct: 0, explanation: "Richter scale measures seismic energy." },
  { id: 305, category: "Physics", question: "What is electric power formula?", options: ["IV", "I\u00b2R", "V\u00b2/R", "All correct"], correct: 3, explanation: "P = IV = I\u00b2R = V\u00b2/R." },
  { id: 306, category: "Physics", question: "Which is faster \u2014 light or sound?", options: ["Light", "Sound", "Same", "Depends"], correct: 0, explanation: "Light: 3\u00d710\u2078 m/s vs sound: 343 m/s." },
  { id: 307, category: "Physics", question: "What is the unit of time?", options: ["Hour", "Second", "Minute", "Year"], correct: 1, explanation: "Second (s) is SI base unit." },
  { id: 308, category: "Physics", question: "Which scientist discovered radioactivity?", options: ["Rutherford", "Curie", "Becquerel", "Einstein"], correct: 2, explanation: "Henri Becquerel in 1896." },
  { id: 309, category: "Physics", question: "Which element is used in nuclear reactors?", options: ["Iron", "Uranium", "Gold", "Sodium"], correct: 1, explanation: "U-235 is fissile fuel." },
  { id: 310, category: "Physics", question: "What is Bernoulli's principle about?", options: ["Pressure-velocity in fluids", "Heat", "Magnetism", "Gravity"], correct: 0, explanation: "Higher velocity = lower pressure." },
  { id: 311, category: "Physics", question: "Which planet has the strongest magnetic field?", options: ["Earth", "Mars", "Jupiter", "Mercury"], correct: 2, explanation: "Jupiter's field is 14\u00d7 Earth's." },
  { id: 312, category: "Physics", question: "What instrument measures wind speed?", options: ["Barometer", "Anemometer", "Hygrometer", "Thermometer"], correct: 1, explanation: "Anemometers measure wind speed." },
  { id: 313, category: "Physics", question: "Which scientist developed quantum theory?", options: ["Einstein", "Planck", "Bohr", "Newton"], correct: 1, explanation: "Max Planck (1900)." },
  { id: 314, category: "Physics", question: "What is electric current direction (conventional)?", options: ["Negative to positive", "Positive to negative", "No direction", "Depends"], correct: 1, explanation: "Conventional current: + to -." },
  { id: 315, category: "Physics", question: "Which physical quantity is scalar?", options: ["Force", "Velocity", "Mass", "Acceleration"], correct: 2, explanation: "Mass has only magnitude." },
  { id: 316, category: "Physics", question: "What is dispersion of light?", options: ["Reflection", "Splitting into colors", "Absorption", "Bending"], correct: 1, explanation: "Light splitting into spectrum (e.g., prism)." },
  { id: 317, category: "Physics", question: "Which gas is used in welding (inert)?", options: ["O2", "N2", "Argon", "H2"], correct: 2, explanation: "Argon shields weld from oxidation." },
  { id: 318, category: "Physics", question: "Which device is used to detect radiation?", options: ["Voltmeter", "Geiger counter", "Spectrometer", "Telescope"], correct: 1, explanation: "Geiger-M\u00fcller tube detects ionizing radiation." },
  { id: 319, category: "Physics", question: "What is sublimation?", options: ["Solid to liquid", "Liquid to gas", "Solid to gas", "Gas to liquid"], correct: 2, explanation: "Direct solid-to-gas (e.g., CO2)." },
  { id: 320, category: "Astronomy", question: "What is a galaxy?", options: ["A planet", "A star system", "Group of stars", "Solar system"], correct: 2, explanation: "Galaxies contain billions of stars + gas + dark matter." },
  { id: 321, category: "Astronomy", question: "Which planet has the most volcanoes?", options: ["Earth", "Venus", "Mars", "Mercury"], correct: 1, explanation: "Venus has over 1,600 major volcanoes." },
  { id: 322, category: "Astronomy", question: "What is the Sun's energy source?", options: ["Combustion", "Fission", "Fusion", "Chemical"], correct: 2, explanation: "Hydrogen fusion in the core." },
  { id: 323, category: "Astronomy", question: "Which is the brightest star in night sky?", options: ["Polaris", "Sirius", "Vega", "Betelgeuse"], correct: 1, explanation: "Sirius (Alpha Canis Majoris)." },
  { id: 324, category: "Astronomy", question: "How long does Mars take to orbit the Sun?", options: ["1 year", "1.5 years", "2 years", "3 years"], correct: 1, explanation: "Mars: 687 Earth days (~1.88 years)." },
  { id: 325, category: "Astronomy", question: "What is a comet primarily made of?", options: ["Iron", "Ice and dust", "Rock", "Gas"], correct: 1, explanation: "Comets are dirty snowballs." },
  { id: 326, category: "Astronomy", question: "Which planet is hottest?", options: ["Mercury", "Venus", "Earth", "Mars"], correct: 1, explanation: "Venus surface ~465\u00b0C due to greenhouse." },
  { id: 327, category: "Astronomy", question: "How many moons does Earth have?", options: ["0", "1", "2", "4"], correct: 1, explanation: "Earth has 1 natural satellite." },
  { id: 328, category: "Astronomy", question: "What unit measures stellar distance to nearby stars?", options: ["Astronomical Unit", "Parsec", "Mile", "Kilometer"], correct: 1, explanation: "1 parsec \u2248 3.26 light-years." },
  { id: 329, category: "Astronomy", question: "Which is the smallest planet?", options: ["Mercury", "Venus", "Mars", "Pluto"], correct: 0, explanation: "Mercury (since Pluto is dwarf)." },
  { id: 330, category: "Astronomy", question: "What galaxy is closest to the Milky Way?", options: ["Andromeda", "Triangulum", "Sombrero", "Whirlpool"], correct: 0, explanation: "Andromeda is ~2.5 million light-years away." },
  { id: 331, category: "Astronomy", question: "What causes seasons on Earth?", options: ["Distance from Sun", "Axial tilt", "Moon", "Wind"], correct: 1, explanation: "Earth's 23.5\u00b0 tilt causes seasons." },
  { id: 332, category: "Astronomy", question: "Which mission first landed humans on the Moon?", options: ["Apollo 8", "Apollo 10", "Apollo 11", "Apollo 13"], correct: 2, explanation: "Apollo 11 in 1969." },
  { id: 333, category: "Astronomy", question: "What is the corona?", options: ["Star core", "Sun's outer atmosphere", "Planet", "Comet tail"], correct: 1, explanation: "Visible during total solar eclipses." },
  { id: 334, category: "Astronomy", question: "Which constellation contains the Big Dipper?", options: ["Orion", "Ursa Major", "Cassiopeia", "Lyra"], correct: 1, explanation: "Big Dipper is part of Ursa Major." },
  { id: 335, category: "Astronomy", question: "What is the fastest planet in our solar system?", options: ["Mercury", "Venus", "Earth", "Mars"], correct: 0, explanation: "Mercury orbits at 47 km/s." },
  { id: 336, category: "Astronomy", question: "What is dark matter?", options: ["Visible matter", "Invisible mass", "Empty space", "Plasma"], correct: 1, explanation: "Dark matter doesn't emit light but has gravity." },
  { id: 337, category: "Astronomy", question: "Which is largest moon of Saturn?", options: ["Titan", "Enceladus", "Mimas", "Rhea"], correct: 0, explanation: "Titan is bigger than Mercury." },
  { id: 338, category: "Astronomy", question: "Which space telescope launched in 2021?", options: ["Hubble", "JWST", "Chandra", "Spitzer"], correct: 1, explanation: "James Webb Space Telescope." },
  { id: 339, category: "Astronomy", question: "What is the asteroid belt between?", options: ["Earth-Mars", "Mars-Jupiter", "Jupiter-Saturn", "Sun-Mercury"], correct: 1, explanation: "Between Mars and Jupiter." },
  { id: 340, category: "Astronomy", question: "Which planet has the longest day?", options: ["Mercury", "Venus", "Earth", "Mars"], correct: 1, explanation: "Venus rotates once every 243 Earth days." },
  { id: 341, category: "Astronomy", question: "What is a black hole?", options: ["Empty space", "Region where gravity prevents light escape", "Dead star", "Planet"], correct: 1, explanation: "Black holes have escape velocity > c." },
  { id: 342, category: "Astronomy", question: "Which planet has the highest mountain?", options: ["Earth", "Mars", "Venus", "Mercury"], correct: 1, explanation: "Olympus Mons on Mars: 22 km tall." },
  { id: 343, category: "Astronomy", question: "Which planet has the most powerful winds?", options: ["Jupiter", "Saturn", "Neptune", "Uranus"], correct: 2, explanation: "Neptune's winds reach 2,100 km/h." },
  { id: 344, category: "Astronomy", question: "What is a nebula?", options: ["Star", "Cloud of gas/dust", "Planet", "Black hole"], correct: 1, explanation: "Stellar nurseries or remnants." },
  { id: 345, category: "Astronomy", question: "How old is the universe (approx)?", options: ["4.5 B years", "13.8 B years", "20 B years", "1 B years"], correct: 1, explanation: "Big Bang ~13.8 billion years ago." },
  { id: 346, category: "Astronomy", question: "Which planet has Great Red Spot?", options: ["Mars", "Jupiter", "Saturn", "Neptune"], correct: 1, explanation: "A giant storm on Jupiter." },
  { id: 347, category: "Astronomy", question: "What is the milky way classification?", options: ["Spiral", "Elliptical", "Irregular", "Lenticular"], correct: 0, explanation: "Barred spiral galaxy." },
  { id: 348, category: "Astronomy", question: "Which is closer to Earth: Sun or Moon?", options: ["Sun", "Moon", "Same", "Varies"], correct: 1, explanation: "Moon: ~384,400 km vs Sun: ~150 M km." },
  { id: 349, category: "Astronomy", question: "Which planet has rings (besides Saturn)?", options: ["Mercury", "Venus", "Jupiter", "All gas giants"], correct: 3, explanation: "Jupiter, Saturn, Uranus, Neptune all have rings." },
  { id: 350, category: "Astronomy", question: "What is the heliosphere?", options: ["Sun", "Bubble of solar wind", "Atmosphere", "Galaxy"], correct: 1, explanation: "Region dominated by solar wind." },
  { id: 351, category: "Astronomy", question: "Which probe left the solar system first?", options: ["Voyager 1", "Voyager 2", "Pioneer 10", "Cassini"], correct: 0, explanation: "Voyager 1 entered interstellar space in 2012." },
  { id: 352, category: "Astronomy", question: "What is a meteor?", options: ["Rock in space", "Streak of light from burning rock", "Star", "Comet"], correct: 1, explanation: "Meteoroid burning in atmosphere." },
  { id: 353, category: "Astronomy", question: "What is the Hubble constant about?", options: ["Universe size", "Expansion rate", "Star age", "Galaxy mass"], correct: 1, explanation: "Rate of universe expansion." },
  { id: 354, category: "Astronomy", question: "Which spacecraft orbits Mercury?", options: ["Cassini", "Juno", "MESSENGER", "BepiColombo"], correct: 3, explanation: "BepiColombo (joint ESA-JAXA, en route)." },
  { id: 355, category: "Astronomy", question: "What is the name of our galaxy's central black hole?", options: ["Cygnus X-1", "Sagittarius A*", "M87*", "Virgo A"], correct: 1, explanation: "Sgr A* is ~4 million solar masses." },
  { id: 356, category: "Astronomy", question: "Which gas giant has the smallest mass?", options: ["Jupiter", "Saturn", "Uranus", "Neptune"], correct: 2, explanation: "Uranus is the lightest gas/ice giant." },
  { id: 357, category: "Astronomy", question: "What is a pulsar?", options: ["Spinning neutron star", "Black hole", "Galaxy", "Quasar"], correct: 0, explanation: "Rapidly rotating neutron stars emit beams." },
  { id: 358, category: "Astronomy", question: "Which is the densest planet?", options: ["Earth", "Mars", "Mercury", "Venus"], correct: 0, explanation: "Earth: 5.51 g/cm\u00b3." },
  { id: 359, category: "Astronomy", question: "How many planets have moons?", options: ["3", "5", "6", "8"], correct: 2, explanation: "All except Mercury and Venus." },
  { id: 360, category: "Astronomy", question: "What is the Kuiper Belt?", options: ["Asteroid region", "Region beyond Neptune", "Solar wind", "Galaxy"], correct: 1, explanation: "Icy bodies beyond Neptune (includes Pluto)." },
  { id: 361, category: "Astronomy", question: "Which type of star is the Sun?", options: ["Red dwarf", "White dwarf", "Yellow dwarf", "Blue giant"], correct: 2, explanation: "Sun is a G-type main-sequence (G2V)." },
  { id: 362, category: "Astronomy", question: "What is redshift?", options: ["Light bending", "Wavelength stretching", "Star color", "Heat"], correct: 1, explanation: "Indicates objects moving away (Doppler)." },
  { id: 363, category: "Astronomy", question: "Which dwarf planet was demoted in 2006?", options: ["Ceres", "Pluto", "Eris", "Haumea"], correct: 1, explanation: "Pluto reclassified as dwarf planet." },
  { id: 364, category: "Astronomy", question: "Which planet has the longest year?", options: ["Saturn", "Uranus", "Neptune", "Pluto"], correct: 2, explanation: "Neptune: 165 Earth years." },
  { id: 365, category: "Astronomy", question: "What is a neutron star?", options: ["Dense stellar remnant", "Active star", "Brown dwarf", "Galaxy"], correct: 0, explanation: "Collapsed core after supernova." },
  { id: 366, category: "Astronomy", question: "Which moon has subsurface ocean?", options: ["Phobos", "Europa", "Deimos", "Titan"], correct: 1, explanation: "Europa likely has liquid ocean under ice." },
  { id: 367, category: "Astronomy", question: "What was the first artificial satellite?", options: ["Sputnik 1", "Explorer 1", "Apollo 1", "Vostok 1"], correct: 0, explanation: "Sputnik 1, USSR, 1957." },
  { id: 368, category: "Astronomy", question: "Which is Saturn's most prominent feature?", options: ["Storms", "Rings", "Moons", "Color"], correct: 1, explanation: "Saturn's rings extend ~282,000 km." },
  { id: 369, category: "Astronomy", question: "Which color star is hottest?", options: ["Red", "Yellow", "White", "Blue"], correct: 3, explanation: "Blue stars: >25,000 K." },
  { id: 370, category: "Astronomy", question: "Which planet is closest to Earth?", options: ["Mars", "Venus", "Mercury", "Jupiter"], correct: 1, explanation: "Venus comes nearest at ~38 M km." },
  { id: 371, category: "Astronomy", question: "What is the Milky Way diameter?", options: ["1,000 ly", "100,000 ly", "1 million ly", "10 million ly"], correct: 1, explanation: "About 100,000 light-years across." },
  { id: 372, category: "Astronomy", question: "Which probe explored Pluto?", options: ["Voyager 1", "New Horizons", "Cassini", "Juno"], correct: 1, explanation: "New Horizons flew by Pluto in 2015." },
  { id: 373, category: "Astronomy", question: "What is parallax used for?", options: ["Star brightness", "Star distance", "Star color", "Star size"], correct: 1, explanation: "Parallax measures nearby star distances." },
  { id: 374, category: "Astronomy", question: "Which planet has tilted rings?", options: ["Saturn", "Jupiter", "Uranus", "Neptune"], correct: 2, explanation: "Uranus' rings are nearly vertical (98\u00b0 tilt)." },
  { id: 375, category: "Astronomy", question: "What is the photosphere?", options: ["Sun's visible surface", "Corona", "Core", "Chromosphere"], correct: 0, explanation: "The visible 'surface' of the Sun (~5,500\u00b0C)." },
  { id: 376, category: "Astronomy", question: "Which constellation is the zodiac in?", options: ["Polar", "Ecliptic", "Equator", "Galactic"], correct: 1, explanation: "Zodiac is along the ecliptic plane." },
  { id: 377, category: "Astronomy", question: "How many stars are in our galaxy (approx)?", options: ["1 million", "1 billion", "100 billion", "1 trillion"], correct: 2, explanation: "Milky Way has ~100-400 billion stars." },
  { id: 378, category: "Astronomy", question: "What is the smallest unit of cosmic distance?", options: ["AU", "Parsec", "Light-year", "Megaparsec"], correct: 0, explanation: "Astronomical Unit (AU) = Earth-Sun distance." },
  { id: 379, category: "Astronomy", question: "Which planet has hexagonal storm?", options: ["Jupiter", "Saturn", "Uranus", "Neptune"], correct: 1, explanation: "Saturn's north pole hexagonal storm." },
  { id: 380, category: "Astronomy", question: "What is a quasar?", options: ["Galaxy core", "Bright quasi-stellar object", "Pulsar", "Comet"], correct: 1, explanation: "Active galactic nuclei powered by supermassive black holes." },
  { id: 381, category: "Astronomy", question: "How many constellations are officially recognized?", options: ["66", "88", "100", "144"], correct: 1, explanation: "IAU recognizes 88 constellations." },
  { id: 382, category: "Astronomy", question: "Which planet rotates clockwise (retrograde)?", options: ["Mars", "Venus", "Mercury", "Earth"], correct: 1, explanation: "Venus and Uranus rotate retrograde." },
  { id: 383, category: "Astronomy", question: "Which space agency launched JWST?", options: ["NASA", "ESA", "JAXA", "All three"], correct: 3, explanation: "Joint NASA, ESA, CSA mission." },
  { id: 384, category: "Astronomy", question: "Which probe has orbited Jupiter since 2016?", options: ["Juno", "Voyager", "Cassini", "Galileo"], correct: 0, explanation: "Juno entered Jupiter orbit July 2016." },
  { id: 385, category: "Astronomy", question: "What is the cosmic microwave background?", options: ["Sound", "Big Bang afterglow", "Dark matter", "Sunlight"], correct: 1, explanation: "Relic radiation from ~380,000 yr after Big Bang." },
  { id: 386, category: "Astronomy", question: "Which is largest object in solar system?", options: ["Sun", "Jupiter", "Earth", "Saturn"], correct: 0, explanation: "Sun has 99.86% of system mass." },
  { id: 387, category: "Astronomy", question: "Which moon is volcanically active?", options: ["Europa", "Io", "Titan", "Ganymede"], correct: 1, explanation: "Io has hundreds of active volcanoes." },
  { id: 388, category: "Astronomy", question: "Which planet has a moon larger than Mercury?", options: ["Earth", "Jupiter", "Saturn", "Both Jupiter and Saturn"], correct: 3, explanation: "Ganymede AND Titan are bigger than Mercury." },
  { id: 389, category: "Astronomy", question: "What is escape velocity from the Moon?", options: ["2.4 km/s", "11.2 km/s", "5 km/s", "15 km/s"], correct: 0, explanation: "Lunar escape velocity is ~2.38 km/s." },
  { id: 390, category: "Astronomy", question: "What is the speed of solar wind?", options: ["100 km/s", "400 km/s", "3,000 km/s", "30,000 km/s"], correct: 1, explanation: "Solar wind: ~250-750 km/s." },
  { id: 391, category: "Astronomy", question: "Which planet was discovered by mathematics first?", options: ["Mars", "Uranus", "Neptune", "Pluto"], correct: 2, explanation: "Neptune predicted from Uranus' orbit anomalies." },
  { id: 392, category: "Astronomy", question: "Who proved Earth orbits the Sun?", options: ["Newton", "Galileo", "Copernicus", "Kepler"], correct: 2, explanation: "Copernicus' heliocentric model (1543)." },
  { id: 393, category: "Astronomy", question: "How many planets in our solar system have rings?", options: ["1", "2", "3", "4"], correct: 3, explanation: "All four gas/ice giants." },
  { id: 394, category: "Astronomy", question: "What is the chromosphere?", options: ["Sun's middle atmosphere", "Core", "Photosphere", "Surface"], correct: 0, explanation: "Layer above photosphere, below corona." },
  { id: 395, category: "Astronomy", question: "Which is the largest dwarf planet?", options: ["Pluto", "Eris", "Haumea", "Ceres"], correct: 1, explanation: "Eris is slightly more massive than Pluto." },
  { id: 396, category: "Astronomy", question: "Which planet has the strongest magnetosphere?", options: ["Earth", "Jupiter", "Saturn", "Neptune"], correct: 1, explanation: "Jupiter's magnetosphere is the largest in the solar system." },
  { id: 397, category: "Astronomy", question: "What was first man-made object in space?", options: ["Apollo 11", "Sputnik 1", "Vostok 1", "Explorer 1"], correct: 1, explanation: "Sputnik 1 on October 4, 1957." },
  { id: 398, category: "Astronomy", question: "Which is the hottest star type?", options: ["O", "B", "M", "G"], correct: 0, explanation: "O-type stars exceed 30,000 K." },
  { id: 399, category: "Astronomy", question: "Which planet has 'shepherd moons'?", options: ["Jupiter", "Saturn", "Uranus", "Both Saturn and Uranus"], correct: 3, explanation: "Shepherd moons confine ring particles." },
  { id: 400, category: "Astronomy", question: "Which is youngest planet in solar system?", options: ["Mercury", "Venus", "Earth", "All same age"], correct: 3, explanation: "All formed ~4.5 billion years ago." },
  { id: 401, category: "Astronomy", question: "What is solar prominence?", options: ["Sunspot", "Loop of plasma", "Solar wind", "Comet"], correct: 1, explanation: "Bright loop arc above Sun's surface." },
  { id: 402, category: "Astronomy", question: "Which mission discovered first exoplanet?", options: ["Hubble", "Kepler", "TESS", "Voyager"], correct: 1, explanation: "Kepler (2009) discovered thousands of exoplanets." },

];

type QuizState = "menu" | "playing" | "review";

const Quizzes = () => {
  const [state, setState] = useState<QuizState>("menu");
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [category, setCategory] = useState("All");
  const { user } = useAuth();
  const { toast } = useToast();

  const questions = category === "All" ? allQuestions : allQuestions.filter((q) => q.category === category);
  const score = answers.reduce((s, a, i) => (a === questions[i]?.correct ? s + 1 : s), 0);

  const startQuiz = (cat: string) => {
    setCategory(cat);
    setState("playing");
    setCurrentQ(0);
    setSelected(null);
    setAnswers([]);
    setShowExplanation(false);
  };

  const submitAnswer = () => {
    setAnswers([...answers, selected]);
    setShowExplanation(true);
  };

  const saveScore = async () => {
    if (!user) return;
    await supabase.from("quiz_scores").insert({
      user_id: user.id,
      category,
      score,
      total: questions.length,
      answers: answers as any,
    });
    toast({ title: "Score saved!", description: `${score}/${questions.length} recorded.` });
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      setState("review");
      saveScore();
    } else {
      setCurrentQ(currentQ + 1);
      setSelected(null);
      setShowExplanation(false);
    }
  };

  const q = questions[currentQ];

  const categoryMeta = [
    { cat: "All", icon: Zap, desc: "Mixed questions from all subjects", color: "text-primary" },
    { cat: "Biology", icon: Target, desc: "Cell biology, DNA, anatomy & life sciences", color: "text-green-500" },
    { cat: "Astronomy", icon: Sparkles, desc: "Solar system, galaxies, stars & space", color: "text-blue-400" },
    { cat: "Chemistry", icon: Brain, desc: "Atoms, bonds, reactions & periodic table", color: "text-orange-500" },
    { cat: "Physics", icon: Zap, desc: "Forces, energy, waves & quantum mechanics", color: "text-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <h1 className="text-lg font-bold">Quizzes</h1>
          {state === "playing" && (
            <Badge variant="secondary" className="ml-auto font-mono-data text-xs">
              {currentQ + 1} / {questions.length}
            </Badge>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {state === "menu" && (
            <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              <div className="text-center space-y-2">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Test Your Knowledge</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {allQuestions.length} entrance-exam-style questions across 4 subjects. Track your scores over time.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {categoryMeta.map((item) => {
                  const count = item.cat === "All" ? allQuestions.length : allQuestions.filter((q) => q.category === item.cat).length;
                  return (
                    <motion.button
                      key={item.cat}
                      whileHover={{ y: -3 }}
                      onClick={() => startQuiz(item.cat)}
                      className="glass-card-hover p-5 text-left flex items-start gap-4"
                    >
                      <div className={`h-10 w-10 rounded-[10px] bg-secondary flex items-center justify-center shrink-0 ${item.color}`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">{item.cat}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                        <Badge variant="secondary" className="mt-2 text-[10px]">{count} questions</Badge>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {state === "playing" && q && (
            <motion.div key={`q-${currentQ}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
              <Progress value={((currentQ + 1) / questions.length) * 100} className="h-1.5" />
              <div className="glass-card p-6 space-y-6">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">{q.category}</Badge>
                  <span className="text-xs text-muted-foreground">Question {currentQ + 1}</span>
                </div>
                <h2 className="text-xl font-bold">{q.question}</h2>
                <div className="space-y-3">
                  {q.options.map((opt, i) => {
                    const isSelected = selected === i;
                    const isCorrect = showExplanation && i === q.correct;
                    const isWrong = showExplanation && isSelected && i !== q.correct;
                    return (
                      <button
                        key={i}
                        disabled={showExplanation}
                        onClick={() => setSelected(i)}
                        className={`w-full text-left p-4 rounded-[10px] border transition-all text-sm ${
                          isCorrect ? "border-green-500 bg-green-500/10 text-foreground"
                          : isWrong ? "border-destructive bg-destructive/10 text-foreground"
                          : isSelected ? "border-primary bg-primary/10 text-foreground"
                          : "border-border hover:border-primary/50 hover:bg-secondary/50 text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold shrink-0">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span>{opt}</span>
                          {isCorrect && <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />}
                          {isWrong && <XCircle className="h-4 w-4 text-destructive ml-auto" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {showExplanation && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-[10px] bg-secondary/50 border border-border">
                    <p className="text-xs font-semibold mb-1">Explanation</p>
                    <p className="text-sm text-muted-foreground">{q.explanation}</p>
                  </motion.div>
                )}
                <div className="flex justify-end gap-3">
                  {!showExplanation ? (
                    <Button onClick={submitAnswer} disabled={selected === null}>Submit Answer</Button>
                  ) : (
                    <Button onClick={nextQuestion}>
                      {currentQ + 1 >= questions.length ? "See Results" : "Next Question"} <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {state === "review" && (
            <motion.div key="review" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 text-center">
              <div className="glass-card p-8 space-y-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Trophy className={`h-10 w-10 ${score >= questions.length * 0.7 ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <h2 className="text-3xl font-bold font-mono-data">{score}/{questions.length}</h2>
                <p className="text-sm text-muted-foreground">
                  {score === questions.length ? "Perfect score! 🎉" : score >= questions.length * 0.7 ? "Great job! Keep it up! 🔥" : "Keep practicing, you'll get there! 💪"}
                </p>
                <Progress value={(score / questions.length) * 100} className="h-2 max-w-xs mx-auto" />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {questions.map((q, i) => (
                  <div key={q.id} className="glass-card p-4 flex items-center gap-3 text-left">
                    {answers[i] === q.correct ? (
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{q.question}</p>
                      <p className="text-xs text-muted-foreground">Correct: {q.options[q.correct]}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => setState("menu")}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back to Menu
                </Button>
                <Button onClick={() => startQuiz(category)}>
                  <RotateCcw className="h-4 w-4 mr-1" /> Try Again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Quizzes;
