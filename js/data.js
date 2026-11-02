// Static data: Sri Lankan meal options and exercise library.
// Food item format: { f: food, q: quantity, u: unit, k: kcal, p: protein g }
// Meal option "t" (type): "v" = vegetarian, "e" = contains egg, "n" = meat / fish

const MEALS = {
  breakfast: [
    { name: "String hoppers & dhal", t: "v", items: [
      { f: "String hoppers (red flour)", q: 8, u: "pcs", k: 280, p: 6 },
      { f: "Dhal curry", q: 0.5, u: "cup", k: 115, p: 7 },
      { f: "Pol sambol (light)", q: 2, u: "tbsp", k: 60, p: 1 } ] },
    { name: "Oats porridge with fruit", t: "v", items: [
      { f: "Rolled oats", q: 0.5, u: "cup", k: 150, p: 5 },
      { f: "Low-fat milk", q: 1, u: "cup", k: 100, p: 8 },
      { f: "Banana (ambul)", q: 1, u: "pcs", k: 105, p: 1 },
      { f: "Peanuts", q: 1, u: "tbsp", k: 55, p: 2 } ] },
    { name: "Boiled chickpeas (kadala)", t: "v", items: [
      { f: "Boiled chickpeas", q: 1, u: "cup", k: 270, p: 15 },
      { f: "Grated coconut", q: 1, u: "tbsp", k: 35, p: 0 },
      { f: "Onion & green chilli tempering", q: 1, u: "tbsp", k: 30, p: 0 },
      { f: "Plain tea (no sugar)", q: 1, u: "cup", k: 5, p: 0 } ] },
    { name: "Egg omelette & wholemeal bread", t: "e", items: [
      { f: "Egg omelette (little oil)", q: 2, u: "eggs", k: 180, p: 12 },
      { f: "Wholemeal bread", q: 2, u: "slices", k: 160, p: 8 },
      { f: "Tomato & cucumber salad", q: 1, u: "cup", k: 25, p: 1 } ] },
    { name: "Kurakkan roti & boiled egg", t: "e", items: [
      { f: "Kurakkan (finger millet) roti", q: 2, u: "pcs", k: 240, p: 6 },
      { f: "Lunu miris", q: 1, u: "tbsp", k: 20, p: 0 },
      { f: "Boiled egg", q: 1, u: "pcs", k: 78, p: 6 } ] },
    { name: "Boiled green gram (mung ata)", t: "v", items: [
      { f: "Boiled green gram", q: 1, u: "cup", k: 210, p: 14 },
      { f: "Grated coconut", q: 1, u: "tbsp", k: 35, p: 0 },
      { f: "Papaya", q: 1, u: "cup", k: 60, p: 1 } ] },
    { name: "Hoppers with fish curry", t: "n", items: [
      { f: "Plain hoppers (appa)", q: 3, u: "pcs", k: 270, p: 5 },
      { f: "Fish curry (no coconut milk)", q: 75, u: "g", k: 110, p: 17 },
      { f: "Seeni sambol", q: 1, u: "tbsp", k: 40, p: 0 } ] },
  ],

  snack: [
    { name: "Fruit bowl", t: "v", items: [
      { f: "Papaya", q: 1, u: "cup", k: 60, p: 1 },
      { f: "Banana", q: 1, u: "pcs", k: 105, p: 1 } ] },
    { name: "Curd with fruit", t: "v", items: [
      { f: "Low-fat curd / yogurt", q: 1, u: "cup", k: 150, p: 8 },
      { f: "Apple or guava", q: 1, u: "pcs", k: 70, p: 1 } ] },
    { name: "Roasted peanuts", t: "v", items: [
      { f: "Roasted peanuts (unsalted)", q: 30, u: "g", k: 170, p: 7 },
      { f: "Plain tea (no sugar)", q: 1, u: "cup", k: 5, p: 0 } ] },
    { name: "King coconut & nuts", t: "v", items: [
      { f: "King coconut water (thambili)", q: 1, u: "nut", k: 60, p: 1 },
      { f: "Almonds / cashews", q: 10, u: "pcs", k: 80, p: 3 } ] },
    { name: "Boiled eggs", t: "e", items: [
      { f: "Boiled egg", q: 2, u: "pcs", k: 155, p: 12 } ] },
    { name: "Boiled cowpea", t: "v", items: [
      { f: "Boiled cowpea (kawpi)", q: 0.75, u: "cup", k: 150, p: 10 },
      { f: "Grated coconut", q: 1, u: "tsp", k: 12, p: 0 } ] },
    { name: "Milk & dates", t: "v", items: [
      { f: "Low-fat milk", q: 1, u: "cup", k: 100, p: 8 },
      { f: "Dates", q: 3, u: "pcs", k: 70, p: 1 } ] },
    { name: "Tuna sandwich", t: "n", items: [
      { f: "Wholemeal bread", q: 2, u: "slices", k: 160, p: 8 },
      { f: "Canned tuna (in water)", q: 50, u: "g", k: 60, p: 13 } ] },
  ],

  lunch: [
    { name: "Rice & chicken curry", t: "n", items: [
      { f: "Red rice (cooked)", q: 1, u: "cup", k: 215, p: 5 },
      { f: "Chicken curry (skinless)", q: 100, u: "g", k: 190, p: 25 },
      { f: "Dhal curry", q: 0.5, u: "cup", k: 115, p: 7 },
      { f: "Gotukola sambol", q: 1, u: "cup", k: 40, p: 1 },
      { f: "Beans curry", q: 0.5, u: "cup", k: 60, p: 2 } ] },
    { name: "Rice & fish curry", t: "n", items: [
      { f: "Red rice (cooked)", q: 1, u: "cup", k: 215, p: 5 },
      { f: "Fish curry (thalapath / balaya)", q: 100, u: "g", k: 150, p: 22 },
      { f: "Kankun / mukunuwenna mallum", q: 1, u: "cup", k: 50, p: 3 },
      { f: "Beetroot curry", q: 0.5, u: "cup", k: 50, p: 1 },
      { f: "Dhal curry", q: 0.5, u: "cup", k: 115, p: 7 } ] },
    { name: "Rice & soya meat curry", t: "v", items: [
      { f: "Red rice (cooked)", q: 1, u: "cup", k: 215, p: 5 },
      { f: "Soya meat curry", q: 0.5, u: "cup", k: 150, p: 15 },
      { f: "Dhal curry", q: 0.5, u: "cup", k: 115, p: 7 },
      { f: "Cabbage mallum", q: 1, u: "cup", k: 45, p: 2 },
      { f: "Pumpkin curry", q: 0.5, u: "cup", k: 60, p: 1 } ] },
    { name: "Rice & egg curry", t: "e", items: [
      { f: "Red rice (cooked)", q: 1, u: "cup", k: 215, p: 5 },
      { f: "Egg curry", q: 2, u: "eggs", k: 200, p: 13 },
      { f: "Carrot & leek stir-fry", q: 0.5, u: "cup", k: 60, p: 1 },
      { f: "Cucumber & tomato salad", q: 1, u: "cup", k: 25, p: 1 },
      { f: "Polos (young jackfruit) curry", q: 0.5, u: "cup", k: 80, p: 2 } ] },
    { name: "Chapati & chickpea curry", t: "v", items: [
      { f: "Wholemeal chapati", q: 2, u: "pcs", k: 200, p: 6 },
      { f: "Chickpea curry", q: 1, u: "cup", k: 270, p: 14 },
      { f: "Cucumber salad", q: 1, u: "cup", k: 20, p: 1 },
      { f: "Low-fat curd", q: 0.5, u: "cup", k: 75, p: 4 } ] },
    { name: "Rice & lean beef / mutton", t: "n", items: [
      { f: "Red rice (cooked)", q: 1, u: "cup", k: 215, p: 5 },
      { f: "Lean beef curry (dry)", q: 90, u: "g", k: 200, p: 24 },
      { f: "Ash plantain curry", q: 0.5, u: "cup", k: 80, p: 1 },
      { f: "Gotukola sambol", q: 1, u: "cup", k: 40, p: 1 },
      { f: "Long beans stir-fry", q: 0.5, u: "cup", k: 50, p: 2 } ] },
  ],

  dinner: [
    { name: "String hoppers & fish curry", t: "n", items: [
      { f: "String hoppers (red flour)", q: 8, u: "pcs", k: 280, p: 6 },
      { f: "Fish curry", q: 100, u: "g", k: 150, p: 22 },
      { f: "Gotukola sambol", q: 1, u: "cup", k: 40, p: 1 } ] },
    { name: "Grilled chicken & sweet potato", t: "n", items: [
      { f: "Grilled / devilled chicken (low oil)", q: 120, u: "g", k: 200, p: 30 },
      { f: "Boiled sweet potato (bathala)", q: 1, u: "medium", k: 110, p: 2 },
      { f: "Vegetable soup", q: 1, u: "bowl", k: 100, p: 3 } ] },
    { name: "Kurakkan roti & dhal", t: "v", items: [
      { f: "Kurakkan roti", q: 2, u: "pcs", k: 240, p: 6 },
      { f: "Dhal curry", q: 0.75, u: "cup", k: 170, p: 10 },
      { f: "Green salad", q: 1, u: "cup", k: 25, p: 1 } ] },
    { name: "Pittu & kiri hodi", t: "v", items: [
      { f: "Red rice pittu", q: 1, u: "cup", k: 230, p: 4 },
      { f: "Light kiri hodi", q: 0.5, u: "cup", k: 110, p: 1 },
      { f: "Gotukola sambol", q: 1, u: "cup", k: 40, p: 1 },
      { f: "Boiled green gram", q: 0.5, u: "cup", k: 105, p: 7 } ] },
    { name: "Roti & egg vegetable stir-fry", t: "e", items: [
      { f: "Wholemeal roti", q: 2, u: "pcs", k: 220, p: 7 },
      { f: "Egg & vegetable stir-fry", q: 2, u: "eggs", k: 200, p: 14 },
      { f: "Tomato salad", q: 1, u: "cup", k: 25, p: 1 } ] },
    { name: "Lentil & vegetable soup", t: "v", items: [
      { f: "Red lentil & vegetable soup", q: 1.5, u: "bowl", k: 250, p: 14 },
      { f: "Wholemeal bread", q: 2, u: "slices", k: 160, p: 8 } ] },
    { name: "Red rice & dry fish curry", t: "n", items: [
      { f: "Red rice (cooked)", q: 0.75, u: "cup", k: 160, p: 4 },
      { f: "Sprats / dry fish curry", q: 50, u: "g", k: 130, p: 18 },
      { f: "Mixed vegetable curry", q: 1, u: "cup", k: 90, p: 3 },
      { f: "Gotukola sambol", q: 1, u: "cup", k: 40, p: 1 } ] },
  ],
};

// MET values are used to estimate calories burned: kcal = MET × kg × hours
const EXERCISES = {
  // cardio (duration based)
  walk:      { name: "Brisk walking",           met: 4.3, kind: "cardio", lowImpact: true },
  walkJog:   { name: "Walk–jog intervals (2 min walk / 1 min jog)", met: 5.5, kind: "cardio" },
  jog:       { name: "Jogging",                 met: 7.0, kind: "cardio" },
  cycle:     { name: "Cycling (moderate)",      met: 6.8, kind: "cardio", lowImpact: true },
  swim:      { name: "Swimming",                met: 6.0, kind: "cardio", lowImpact: true },
  skip:      { name: "Skipping rope",           met: 10,  kind: "cardio" },
  hiit:      { name: "HIIT intervals (30s on / 30s off)", met: 8.0, kind: "cardio" },
  stairs:    { name: "Stair climbing",          met: 8.0, kind: "cardio" },
  elliptical:{ name: "Elliptical / cross trainer", met: 5.0, kind: "cardio", lowImpact: true },
  yoga:      { name: "Yoga flow",               met: 2.5, kind: "mobility", lowImpact: true },
  stretch:   { name: "Full-body stretching",    met: 2.3, kind: "mobility", lowImpact: true },

  // strength (sets × reps)
  squat:     { name: "Bodyweight squats",       met: 5.0, kind: "strength" },
  chairSquat:{ name: "Chair squats",            met: 3.5, kind: "strength", lowImpact: true },
  pushup:    { name: "Push-ups",                met: 5.0, kind: "strength" },
  kneePush:  { name: "Knee push-ups",           met: 3.8, kind: "strength", lowImpact: true },
  wallPush:  { name: "Wall push-ups",           met: 3.0, kind: "strength", lowImpact: true },
  lunge:     { name: "Lunges",                  met: 5.0, kind: "strength" },
  bridge:    { name: "Glute bridges",           met: 3.5, kind: "strength", lowImpact: true },
  plank:     { name: "Plank",                   met: 4.0, kind: "strength", timed: true },
  row:       { name: "Dumbbell rows",           met: 5.0, kind: "strength", lowImpact: true },
  press:     { name: "Dumbbell shoulder press", met: 5.0, kind: "strength", lowImpact: true },
  curl:      { name: "Dumbbell bicep curls",    met: 4.0, kind: "strength", lowImpact: true },
  dips:      { name: "Chair tricep dips",       met: 5.0, kind: "strength" },
  deadlift:  { name: "Dumbbell Romanian deadlift", met: 6.0, kind: "strength" },
  benchPress:{ name: "Bench / floor press",     met: 6.0, kind: "strength", lowImpact: true },
  calf:      { name: "Calf raises",             met: 3.5, kind: "strength", lowImpact: true },
  climber:   { name: "Mountain climbers",       met: 8.0, kind: "strength", timed: true },
  burpee:    { name: "Burpees",                 met: 8.0, kind: "strength" },
  crunch:    { name: "Crunches",                met: 3.8, kind: "strength" },
  birdDog:   { name: "Bird-dog",                met: 3.0, kind: "strength", lowImpact: true },
  legRaise:  { name: "Lying leg raises",        met: 3.8, kind: "strength" },
};

// Safer swaps for older users or BMI ≥ 30
const LOW_IMPACT_SWAP = {
  jog: "walk", walkJog: "walk", skip: "cycle", hiit: "cycle", stairs: "elliptical",
  squat: "chairSquat", pushup: "kneePush", lunge: "bridge",
  burpee: "bridge", climber: "birdDog", dips: "curl", deadlift: "bridge",
  crunch: "birdDog", legRaise: "birdDog",
};

// YouTube how-to videos (video IDs) shown with the ▶ button next to each exercise.
// All checked as embeddable. Swap an ID here to change a video.
const EXERCISE_VIDEOS = {
  warmup: "f3zOrYCwquE", cooldown: "gfzC9XMEypg",
  walk: "tVpUCkMLgms", walkJog: "2ik5T7xhiSQ", jog: "kVnyY17VS9Y", cycle: "rEqRmKAQ5xM",
  swim: "6_vXycbD2TM", skip: "u3zgHI8QnqE", hiit: "bkhgiktiloQ", stairs: "BmYNpHeDAB0",
  elliptical: "YWfswVvOaiI", yoga: "vNyJuQuuMC8", stretch: "t_YEUWe6Yn8",
  squat: "P-yaD24bUE8", chairSquat: "OViE2ghEop0", pushup: "IODxDxX7oi4", kneePush: "lFR1GWy1Dcs",
  wallPush: "wIPJvBQs7RA", lunge: "ASdqJoDPMHA", bridge: "wPM8icPu6H8", plank: "6LqqeBtFn9M",
  row: "roCP6wCXPqo", press: "0JfYxMRsUCQ", curl: "6DeLZ6cbgWQ", dips: "E7WwqwD7NWE",
  deadlift: "hQgFixeXdZo", benchPress: "uUGDRwge4F8", calf: "eMTy3qylqnE", climber: "cnyTQDSE884",
  burpee: "NCqbpkoiyXE", crunch: "MKmrqcoCZ-M", birdDog: "xEDnlOxeJH4", legRaise: "xJJu-WiROM8",
};
