import { access, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { gunzipSync, gzipSync } from "node:zlib";
import { sanitizeQuestionPrompt } from "./question-prompt-sanitizer.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.resolve(REPO_ROOT, "data", "launch");
const SEED_DIR = path.resolve(REPO_ROOT, "supabase", "seed");
const QUESTION_BANK_FILE = "sample_questions.json";

const BAND_ORDER = ["PREK", "K1", "G23", "G45", "G6"];
const BAND_THEMES = {
  PREK: "animal-adventure",
  K1: "sports-world",
  G23: "space-explorer",
  G45: "building-quest",
  G6: "innovation-lab",
};
const BASE_BAND_TARGETS = {
  PREK: 25000,
  K1: 25000,
  G23: 25000,
  G45: 25000,
  G6: 25000,
};

const SUBJECTS = [
  { code: "early-literacy", display_name: "Early Literacy" },
  { code: "reading", display_name: "Reading" },
  { code: "phonics", display_name: "Phonics" },
  { code: "math", display_name: "Math" },
  { code: "logic", display_name: "Logic" },
  { code: "world-knowledge", display_name: "World Knowledge" },
  { code: "geography", display_name: "Geography" },
  { code: "civics", display_name: "Civics" },
  { code: "science", display_name: "Science" },
  { code: "writing", display_name: "Writing" },
  { code: "history", display_name: "History" },
];

const THEME_FAMILIES = [
  {
    code: "animal-adventure",
    display_name: "Animal Adventure",
    description: "Friendly animal world for younger children.",
  },
  {
    code: "sports-world",
    display_name: "Sports World",
    description: "Playful sports-themed progression with movement and score energy.",
  },
  {
    code: "space-explorer",
    display_name: "Space Explorer",
    description: "Mission-driven world for question bursts and challenge ladders.",
  },
  {
    code: "building-quest",
    display_name: "Building Quest",
    description: "Builder-themed world for strategy and problem solving.",
  },
  {
    code: "innovation-lab",
    display_name: "Innovation Lab",
    description: "Advanced cross-subject challenge world for older learners.",
  },
];

const LAUNCH_BANDS = [
  {
    code: "PREK",
    display_name: "Ages 2 to 5",
    sort_order: 1,
    age_min: 2,
    age_max: 5,
    grade_min: null,
    grade_max: null,
    primary_theme_code: "animal-adventure",
    audience_label: "Pre-primary learners",
  },
  {
    code: "K1",
    display_name: "Kindergarten to Grade 1",
    sort_order: 2,
    age_min: 5,
    age_max: 7,
    grade_min: "K",
    grade_max: "1",
    primary_theme_code: "sports-world",
    audience_label: "Early readers",
  },
  {
    code: "G23",
    display_name: "Grade 2 to Grade 3",
    sort_order: 3,
    age_min: 7,
    age_max: 9,
    grade_min: "2",
    grade_max: "3",
    primary_theme_code: "space-explorer",
    audience_label: "Growing independent learners",
  },
  {
    code: "G45",
    display_name: "Grade 4 to Grade 5",
    sort_order: 4,
    age_min: 9,
    age_max: 11,
    grade_min: "4",
    grade_max: "5",
    primary_theme_code: "building-quest",
    audience_label: "More strategic learners",
  },
  {
    code: "G6",
    display_name: "Grade 6",
    sort_order: 5,
    age_min: 11,
    age_max: 12,
    grade_min: "6",
    grade_max: "6",
    primary_theme_code: "innovation-lab",
    audience_label: "Advanced pre-teen learners",
  },
];

const LAUNCH_BAND_FOCUS = {
  PREK: ["letters", "sounds", "counting", "shapes", "weather and safety"],
  K1: ["phonics", "first words", "addition", "weather patterns", "fairness and community"],
  G23: ["reading practice", "math facts", "science cycles", "world geography", "timelines and civics"],
  G45: ["comprehension", "multi-step math", "ecosystems", "human and physical geography", "civics and elections"],
  G6: ["argument reading", "pre-algebra", "science reasoning", "map scale and population", "source-based civics and history"],
};

const AVATARS = [
  { avatar_key: "bunny-helper", launch_band: "PREK", theme: "animal-adventure", display_name: "Bunny Helper" },
  { avatar_key: "bear-explorer", launch_band: "PREK", theme: "animal-adventure", display_name: "Bear Explorer" },
  { avatar_key: "lion-striker", launch_band: "K1", theme: "sports-world", display_name: "Lion Striker" },
  { avatar_key: "fox-runner", launch_band: "K1", theme: "sports-world", display_name: "Fox Runner" },
  { avatar_key: "panda-pilot", launch_band: "G23", theme: "space-explorer", display_name: "Panda Pilot" },
  { avatar_key: "otter-orbiter", launch_band: "G23", theme: "space-explorer", display_name: "Otter Orbiter" },
  { avatar_key: "owl-builder", launch_band: "G45", theme: "building-quest", display_name: "Owl Builder" },
  { avatar_key: "beaver-architect", launch_band: "G45", theme: "building-quest", display_name: "Beaver Architect" },
  { avatar_key: "lynx-analyst", launch_band: "G6", theme: "innovation-lab", display_name: "Lynx Analyst" },
  { avatar_key: "orca-engineer", launch_band: "G6", theme: "innovation-lab", display_name: "Orca Engineer" },
];

const MODULE_BY_SUBJECT = {
  "early-literacy": "english",
  reading: "english",
  phonics: "english",
  math: "math",
  logic: "logic",
  "world-knowledge": "world-knowledge",
  geography: "geography",
  civics: "civics",
  science: "science",
  writing: "writing",
  history: "history",
};

const PREK_A_WORDS = [
  "apple", "ant", "acorn", "apron", "anchor", "airplane", "alligator", "artist",
  "angel", "arch", "arrow", "astronaut", "avocado", "animal", "alarm", "attic",
  "axe", "accordion", "album", "amber", "alphabet", "athlete", "apartment", "arm",
  "asteroid", "almond", "alley", "aquarium", "atlas", "adventure", "aisle", "alpaca",
  "amethyst", "amulet", "anemone", "apex", "aviary", "armor", "aurora", "applecart",
];
const PREK_B_WORDS = [
  "ball", "bear", "bird", "boat", "banana", "button", "basket", "bubble",
  "butterfly", "beach", "book", "beacon", "bridge", "beetle", "bottle", "bunny",
  "backpack", "blanket", "biscuit", "barn", "branch", "broom", "bucket", "broccoli",
  "band", "bell", "bonnet", "beehive", "boots", "badge", "bamboo", "berry",
  "beaver", "buffalo", "bluebird", "balloon", "bench", "blink", "bicycle", "banner",
];
const COUNT_OBJECTS = [
  "ducks", "stars", "apples", "cars", "boats", "cookies", "leaves", "flowers",
  "buttons", "candles", "shells", "books", "kites", "pencils", "bubbles", "balls",
  "blocks", "berries", "butterflies", "clouds", "crayons", "cups", "drums", "eggs",
  "feathers", "fish", "grapes", "hats", "hearts", "keys", "lanterns", "moons",
  "oranges", "paperclips", "pearls", "planes", "rings", "rocks", "socks", "spoons",
];
const CIRCLE_OBJECTS = [
  "moon", "wheel", "plate", "coin", "cookie", "button", "orange", "bubble",
  "ring", "ball", "sun", "clock", "planet", "donut", "target", "drum",
  "pizza pan", "lifebuoy", "yo-yo", "marble", "medal", "bead", "nest", "steering wheel",
];
const TRIANGLE_OBJECTS = [
  "tent", "pizza slice", "roof", "yield sign", "nacho chip", "pennant", "mountain peak",
  "kite tail pennant", "party hat", "sail", "arrow tip", "sandwich half", "tree top",
  "camp flag", "wedge block", "slice of watermelon", "cat ear", "star point", "ice cream cone",
  "tri-fold easel", "paper pennant", "triangle ruler", "road warning sign", "pyramid side",
];
const RHYME_SETS = [
  { stem: "cat", correct: "hat", distractors: ["dog", "sun"] },
  { stem: "log", correct: "frog", distractors: ["tree", "cup"] },
  { stem: "cake", correct: "lake", distractors: ["ball", "pin"] },
  { stem: "bee", correct: "tree", distractors: ["rock", "sand"] },
  { stem: "star", correct: "car", distractors: ["book", "fish"] },
  { stem: "sun", correct: "fun", distractors: ["leaf", "nest"] },
  { stem: "boat", correct: "goat", distractors: ["shoe", "bell"] },
  { stem: "ball", correct: "wall", distractors: ["rain", "duck"] },
  { stem: "ring", correct: "king", distractors: ["chair", "leaf"] },
  { stem: "pen", correct: "hen", distractors: ["frog", "cup"] },
  { stem: "light", correct: "kite", distractors: ["tree", "book"] },
  { stem: "mouse", correct: "house", distractors: ["rock", "drum"] },
  { stem: "train", correct: "rain", distractors: ["cat", "sun"] },
  { stem: "sock", correct: "clock", distractors: ["bee", "leaf"] },
  { stem: "bell", correct: "shell", distractors: ["car", "star"] },
  { stem: "hill", correct: "pill", distractors: ["book", "frog"] },
  { stem: "map", correct: "cap", distractors: ["train", "shoe"] },
  { stem: "go", correct: "snow", distractors: ["duck", "leaf"] },
  { stem: "fish", correct: "dish", distractors: ["rock", "tree"] },
  { stem: "seed", correct: "reed", distractors: ["cup", "star"] },
];
const COLORS = ["red", "blue", "yellow", "green", "orange", "purple", "pink", "brown", "black", "white"];
const COLOR_OBJECTS = [
  "apple", "sky kite", "banana", "frog", "pumpkin", "grape", "flower", "bear",
  "crow", "snowball", "fire truck", "ocean wave", "sunflower", "leaf", "orange slice", "plum",
  "cotton candy", "tree trunk", "night bat", "cloud", "rose", "bluebird", "lemon", "turtle",
];
const WATER_ITEMS = [
  "fish", "boat", "submarine", "dolphin", "whale", "sea turtle", "octopus", "crab",
  "kayak", "canoe", "sailboat", "shark", "seal", "jellyfish", "anchor", "lifeboat",
];
const LAND_ITEMS = [
  "car", "bus", "rabbit", "horse", "lion", "tractor", "train station", "house",
  "tree", "dog", "cat", "bike", "school", "playground", "farm", "garden",
];
const SKY_ITEMS = [
  "airplane", "helicopter", "bird", "cloud", "balloon", "rocket", "kite", "moon",
];
const PLACE_ACTIVITIES = [
  { answer: "beach", clue: "build sand castles and hear waves" },
  { answer: "forest", clue: "see many tall trees and hear birds" },
  { answer: "farm", clue: "feed animals and see barns" },
  { answer: "park", clue: "swing, slide, and play outside" },
  { answer: "lake", clue: "watch ducks float on calm water" },
  { answer: "mountain", clue: "climb up high rocky paths" },
  { answer: "city", clue: "see tall buildings and busy streets" },
  { answer: "desert", clue: "feel hot sun and see dry sand" },
  { answer: "river", clue: "watch water move in one direction" },
  { answer: "zoo", clue: "visit many animals in one place" },
];
const COMMUNITY_HELPERS = [
  { helper: "firefighter", tool: "hose", place: "fire station", action: "put out fires" },
  { helper: "doctor", tool: "stethoscope", place: "clinic", action: "help sick people feel better" },
  { helper: "teacher", tool: "book", place: "school", action: "help children learn" },
  { helper: "chef", tool: "pan", place: "kitchen", action: "cook meals" },
  { helper: "mail carrier", tool: "mail bag", place: "mail route", action: "bring letters" },
  { helper: "farmer", tool: "tractor", place: "farm", action: "grow food" },
  { helper: "librarian", tool: "library card", place: "library", action: "help people find books" },
  { helper: "builder", tool: "hammer", place: "construction site", action: "build houses" },
  { helper: "police officer", tool: "badge", place: "police station", action: "keep people safe" },
  { helper: "dentist", tool: "tooth mirror", place: "dental office", action: "check teeth" },
];
const SAFE_CHOICES = [
  { scenario: "The floor is wet near the sink.", correct: "walk slowly", wrongs: ["run fast", "jump with socks on"] },
  { scenario: "A friend is still talking during circle time.", correct: "wait for your turn", wrongs: ["shout over the friend", "grab the toy"] },
  { scenario: "You need to cross the street.", correct: "hold an adult's hand", wrongs: ["run ahead alone", "close your eyes and hurry"] },
  { scenario: "Markers are on the table after art.", correct: "put the caps back on", wrongs: ["throw them", "leave them open on the floor"] },
  { scenario: "A classmate drops puzzle pieces.", correct: "help pick them up", wrongs: ["kick them away", "laugh and walk off"] },
  { scenario: "You finish with the scissors.", correct: "put them back safely", wrongs: ["wave them around", "hide them under a chair"] },
  { scenario: "It is time to line up.", correct: "keep hands to yourself", wrongs: ["push to the front", "trip a friend"] },
  { scenario: "The classroom pet looks hungry.", correct: "tell the teacher", wrongs: ["feed random snacks", "bang on the cage"] },
];

const SHORT_A_WORDS = ["cat", "hat", "map", "jam", "bat", "cap", "van", "ham", "flag", "plant", "crab", "stack", "clap", "snack", "track", "glass"];
const SHORT_E_WORDS = ["bed", "pen", "hen", "net", "red", "jet", "vest", "sled", "chest", "step", "dress", "fence", "shell", "melon", "bench", "spell"];
const SHORT_I_WORDS = ["pig", "sit", "fin", "lip", "big", "mix", "swim", "brick", "clip", "drip", "ship", "mint", "hill", "stick", "print", "twin"];
const SIMPLE_WORDS = [
  "goal", "team", "jump", "play", "ball", "book", "home", "frog", "tree", "star",
  "train", "cloud", "smile", "planet", "garden", "rocket", "light", "stone", "music", "brave",
];
const SIGHT_WORDS = ["the", "and", "you", "said", "come", "look", "here", "play", "want", "with", "have", "what", "this", "that", "from", "into"];
const MAP_SYMBOL_FACTS = [
  { clue: "a tree symbol on the map", answer: "park", distractors: ["hospital", "airport"] },
  { clue: "a book symbol on the map", answer: "library", distractors: ["farm", "bridge"] },
  { clue: "a plane symbol on the map", answer: "airport", distractors: ["school", "river"] },
  { clue: "a red cross on the map", answer: "hospital", distractors: ["zoo", "stadium"] },
  { clue: "a train symbol on the map", answer: "station", distractors: ["forest", "farm"] },
  { clue: "a tent symbol on the map", answer: "campground", distractors: ["museum", "city hall"] },
  { clue: "a lion symbol on the map", answer: "zoo", distractors: ["bridge", "lake"] },
  { clue: "a bell symbol on the map", answer: "school", distractors: ["beach", "forest"] },
];
const LANDFORM_FACTS = [
  { clue: "water that flows between banks", answer: "river", distractors: ["mountain", "desert"] },
  { clue: "very high land with a peak", answer: "mountain", distractors: ["lake", "island"] },
  { clue: "a hot dry place with little rain", answer: "desert", distractors: ["forest", "river"] },
  { clue: "land with trees close together", answer: "forest", distractors: ["beach", "bridge"] },
  { clue: "land all around by water", answer: "island", distractors: ["hill", "road"] },
  { clue: "a place with sand next to the ocean", answer: "beach", distractors: ["canyon", "farm"] },
  { clue: "still water surrounded by land", answer: "lake", distractors: ["mountain", "city"] },
  { clue: "deep valley with steep sides", answer: "canyon", distractors: ["field", "river"] },
];
const COMMUNITY_SERVICE_FACTS = [
  { clue: "borrows books for families", answer: "library", distractors: ["airport", "factory"] },
  { clue: "helps when people are hurt", answer: "hospital", distractors: ["stadium", "museum"] },
  { clue: "brings letters and packages", answer: "post office", distractors: ["park", "beach"] },
  { clue: "teaches children each day", answer: "school", distractors: ["farm", "bridge"] },
  { clue: "puts out fires in town", answer: "fire station", distractors: ["river", "campground"] },
  { clue: "helps keep streets safe", answer: "police station", distractors: ["zoo", "garden"] },
];
const FAIRNESS_SCENARIOS = [
  { scenario: "Two students both want the same red marker.", correct: "take turns", wrongs: ["hide the marker", "grab it and run"] },
  { scenario: "The class is voting on a game to play.", correct: "let everyone have one vote", wrongs: ["only let best friends vote", "change the votes after"] },
  { scenario: "You finish a puzzle before your partner.", correct: "offer to help kindly", wrongs: ["tell them they are too slow", "take their pieces away"] },
  { scenario: "A new student does not know the rules.", correct: "explain the rules clearly", wrongs: ["leave them confused", "make up fake rules"] },
  { scenario: "There are only four paint trays.", correct: "share materials carefully", wrongs: ["take two trays", "spill paint to stop others"] },
  { scenario: "A classmate is speaking softly.", correct: "listen and wait", wrongs: ["interrupt loudly", "cover your ears and shout"] },
];

const MAIN_IDEA_TOPICS = [
  { topic: "bees help flowers", details: ["bees carry pollen", "flowers grow seeds", "gardens become colorful"] },
  { topic: "how rain forms", details: ["water warms in the sun", "clouds gather", "drops fall back down"] },
  { topic: "why libraries matter", details: ["people borrow books", "quiet spaces help reading", "librarians guide visitors"] },
  { topic: "how astronauts train", details: ["they practice teamwork", "they learn science", "they use safety drills"] },
  { topic: "what plants need", details: ["roots take in water", "leaves use sunlight", "soil helps hold nutrients"] },
  { topic: "how recycling helps", details: ["materials get reused", "trash stays out of landfills", "people save resources"] },
  { topic: "why animals migrate", details: ["seasons change", "food moves", "weather becomes colder"] },
  { topic: "how bridges are designed", details: ["engineers test models", "materials must be strong", "weight must be balanced"] },
];
const CAUSE_EFFECT_CASES = [
  { cause: "It rained all afternoon.", effect: "the field became muddy" },
  { cause: "The class practiced reading every day.", effect: "the students read more smoothly" },
  { cause: "Maya forgot to water the plant.", effect: "the leaves started to droop" },
  { cause: "The city added more bike lanes.", effect: "more people rode to school" },
  { cause: "The team passed the ball quickly.", effect: "they found an open shot" },
  { cause: "The family sorted paper and cans.", effect: "more items were recycled" },
  { cause: "The scientist changed one test variable.", effect: "she could compare the results clearly" },
  { cause: "The temperature dropped below freezing.", effect: "ice formed on the pond" },
];
const CONTINENT_FACTS = [
  { clue: "Brazil is on this continent.", answer: "South America", distractors: ["Europe", "Africa"] },
  { clue: "Japan is on this continent.", answer: "Asia", distractors: ["South America", "Australia"] },
  { clue: "Kenya is on this continent.", answer: "Africa", distractors: ["Europe", "North America"] },
  { clue: "Canada is on this continent.", answer: "North America", distractors: ["Asia", "Africa"] },
  { clue: "France is on this continent.", answer: "Europe", distractors: ["Australia", "South America"] },
  { clue: "Australia is both a country and this continent.", answer: "Australia", distractors: ["Europe", "Africa"] },
  { clue: "Antarctica is covered in ice and is this continent.", answer: "Antarctica", distractors: ["Asia", "Europe"] },
];
const REGION_CLIMATE_FACTS = [
  { clue: "A desert region usually has this kind of climate.", answer: "dry", distractors: ["icy ocean", "rainforest wet"] },
  { clue: "Rainforests are usually this kind of place.", answer: "warm and wet", distractors: ["dry and cold", "snowy and windy"] },
  { clue: "Mountain regions often feel this way at the top.", answer: "cooler than lower land", distractors: ["hotter than deserts", "always underwater"] },
  { clue: "A coastal town is usually near this feature.", answer: "ocean or sea", distractors: ["volcano crater", "glacier cave"] },
  { clue: "Grassland regions often have this kind of open space.", answer: "wide fields", distractors: ["deep coral reefs", "city tunnels"] },
  { clue: "Arctic regions are known for this climate.", answer: "very cold", distractors: ["very dry and hot", "always tropical"] },
];
const CITIZEN_ACTION_FACTS = [
  { clue: "You see litter in the park.", answer: "put it in the trash", distractors: ["leave more litter", "kick it into the pond"] },
  { clue: "A class vote is happening.", answer: "listen to each choice before voting", distractors: ["vote twice", "hide the ballots"] },
  { clue: "A new student joins the class.", answer: "welcome them and include them", distractors: ["ignore them", "save all the games for yourself"] },
  { clue: "A crosswalk signal says stop.", answer: "wait until it is safe", distractors: ["run across anyway", "text while stepping out"] },
  { clue: "Your town asks for ideas for a new park.", answer: "share a respectful suggestion", distractors: ["tear down the poster", "shout over others only"] },
];
const CONTEXT_CLUE_WORDS = [
  { word: "fragile", meaning: "easy to break", distractors: ["very loud", "full of sugar"] },
  { word: "drowsy", meaning: "sleepy", distractors: ["excited", "hungry"] },
  { word: "generous", meaning: "willing to share", distractors: ["hard to hear", "very tiny"] },
  { word: "scarce", meaning: "hard to find", distractors: ["covered in water", "easy to carry"] },
  { word: "ancient", meaning: "very old", distractors: ["just built", "extremely noisy"] },
  { word: "swift", meaning: "fast", distractors: ["sticky", "careful"] },
  { word: "rural", meaning: "in the countryside", distractors: ["under the ocean", "inside a spaceship"] },
  { word: "observe", meaning: "watch carefully", distractors: ["forget quickly", "jump high"] },
];
const TEXT_EVIDENCE_FACTS = [
  {
    claim: "The town was preparing for a storm.",
    evidence: "Workers nailed boards over the shop windows.",
    distractors: ["Children bought ice cream after school.", "A painter finished a sunny mural downtown."],
  },
  {
    claim: "Leena felt proud of her science fair project.",
    evidence: "She smiled as she explained every part to the judges.",
    distractors: ["She borrowed a marker from a classmate.", "The gym lights were bright that evening."],
  },
  {
    claim: "The trail was difficult to hike.",
    evidence: "The path was steep and covered with slippery rocks.",
    distractors: ["Birds sang from the trees.", "A picnic table stood near the entrance."],
  },
  {
    claim: "The new bike lanes changed travel in the city.",
    evidence: "More families were riding bikes to school than before.",
    distractors: ["Clouds drifted over the stadium.", "The bakery opened at six o'clock."],
  },
];
const INFERENCE_FACTS = [
  {
    setup: "Jordan zipped a heavy coat, pulled on gloves, and saw his breath in the air.",
    answer: "It was cold outside.",
    distractors: ["It was the hottest day of summer.", "Jordan was swimming at the beach."],
  },
  {
    setup: "The lights flickered, thunder rumbled, and Ava closed all the windows quickly.",
    answer: "A storm was starting.",
    distractors: ["A parade was passing by.", "A movie was beginning in the theater."],
  },
  {
    setup: "Carlos kept rereading the directions before he picked up any tools.",
    answer: "He wanted to avoid mistakes.",
    distractors: ["He had already finished the project.", "He was getting ready for lunch."],
  },
  {
    setup: "Mei glanced at the clock, grabbed her backpack, and jogged toward the bus stop.",
    answer: "She was late for the bus.",
    distractors: ["She was going to the swimming pool.", "She had nowhere to go."],
  },
];
const ENGINEERING_FACTS = [
  { clue: "Why do engineers test a bridge model first?", answer: "to see if it is strong and safe", distractors: ["to make it look shiny", "to change the weather"] },
  { clue: "Why might an engineer build a small prototype?", answer: "to try ideas before full building", distractors: ["to hide the real plan forever", "to make the project heavier"] },
  { clue: "Why do engineers measure carefully?", answer: "so parts fit the way they should", distractors: ["so nothing can ever change", "so they can skip planning"] },
  { clue: "Why do engineers improve a design after testing?", answer: "to solve problems they found", distractors: ["to make the design weaker", "to avoid all teamwork"] },
];
const PHYSICAL_HUMAN_FEATURE_FACTS = [
  { clue: "river", answer: "physical feature", distractors: ["human feature", "government branch"] },
  { clue: "bridge", answer: "human feature", distractors: ["physical feature", "planet type"] },
  { clue: "mountain", answer: "physical feature", distractors: ["human feature", "map symbol"] },
  { clue: "highway", answer: "human feature", distractors: ["physical feature", "ocean current"] },
  { clue: "volcano", answer: "physical feature", distractors: ["human feature", "city law"] },
  { clue: "harbor", answer: "human feature", distractors: ["physical feature", "weather pattern"] },
];
const BRANCH_POWER_FACTS = [
  { clue: "Which branch makes laws?", answer: "legislative", distractors: ["executive", "judicial"] },
  { clue: "Which branch carries out laws?", answer: "executive", distractors: ["legislative", "judicial"] },
  { clue: "Which branch decides what laws mean in court?", answer: "judicial", distractors: ["executive", "legislative"] },
  { clue: "Who signs or vetoes bills at the national level?", answer: "the president", distractors: ["the jury", "the mayor alone"] },
];
const ELECTION_PROCESS_FACTS = [
  { clue: "What do citizens do on election day?", answer: "cast votes", distractors: ["build courthouses", "write every law"] },
  { clue: "Why are ballots counted carefully?", answer: "to know which choice got the most votes", distractors: ["to decorate the polling place", "to give everyone two turns"] },
  { clue: "Why do candidates share plans with voters?", answer: "so people can compare ideas", distractors: ["so no one asks questions", "so the weather will change"] },
  { clue: "What happens after votes are counted?", answer: "the winner is announced", distractors: ["all rules disappear", "the election starts over every hour"] },
];
const WEATHER_FACTS = [
  { clue: "You need an umbrella and hear raindrops on the roof.", answer: "rainy", distractors: ["sunny", "snowy"] },
  { clue: "The sky is bright and you want sunglasses.", answer: "sunny", distractors: ["windy", "snowy"] },
  { clue: "Snowflakes fall and people wear mittens.", answer: "snowy", distractors: ["rainy", "sunny"] },
  { clue: "Leaves spin across the playground and kites pull hard.", answer: "windy", distractors: ["foggy", "sunny"] },
  { clue: "You hear thunder and see flashes of lightning.", answer: "stormy", distractors: ["dry", "calm"] },
];
const SENTENCE_COMPLETION_FACTS = [
  { clue: "The puppy can ___ across the yard.", answer: "run", distractors: ["blue", "chair"] },
  { clue: "We read a ___ before bedtime.", answer: "book", distractors: ["jump", "yellow"] },
  { clue: "At lunch I drink cold ___.", answer: "water", distractors: ["window", "laugh"] },
  { clue: "A seed needs soil, light, and ___ to grow.", answer: "water", distractors: ["socks", "music"] },
];
const PAST_PRESENT_FACTS = [
  { clue: "A baby picture from years ago belongs in the...", answer: "past", distractors: ["present", "future"] },
  { clue: "The class is lining up for lunch right now. That is the...", answer: "present", distractors: ["past", "future"] },
  { clue: "A plan for next summer belongs in the...", answer: "future", distractors: ["past", "present"] },
  { clue: "Grandpa tells a story about his first school day. That happened in the...", answer: "past", distractors: ["future", "present"] },
];
const LIFE_CYCLE_FACTS = [
  { clue: "Egg, caterpillar, chrysalis, ___. What comes next?", answer: "butterfly", distractors: ["puddle", "pebble"] },
  { clue: "Seed, sprout, small plant, ___. What comes next?", answer: "adult plant", distractors: ["moon", "ladder"] },
  { clue: "Egg, tadpole, froglet, ___. What is the last stage?", answer: "frog", distractors: ["cloud", "shell"] },
  { clue: "Why do life cycles repeat?", answer: "living things grow and make new life", distractors: ["mountains change color", "maps redraw themselves"] },
];
const PARAGRAPH_SEQUENCE_FACTS = [
  {
    steps: [
      "First Mia planted the seeds.",
      "Next she watered the soil.",
      "Last green sprouts pushed up.",
    ],
  },
  {
    steps: [
      "First Omar mixed the batter.",
      "Next he poured it into the pan.",
      "Last the muffins baked in the oven.",
    ],
  },
  {
    steps: [
      "First the team studied the map.",
      "Next they packed supplies.",
      "Last they started the hike.",
    ],
  },
];
const TIMELINE_ORDER_FACTS = [
  { events: ["wake up", "eat breakfast", "go to school"] },
  { events: ["put on skates", "step onto the ice", "practice a spin"] },
  { events: ["open the book", "read the chapter", "write notes"] },
  { events: ["mix the paint", "brush the poster", "hang it to dry"] },
];
const ECOSYSTEM_CHANGE_FACTS = [
  { clue: "Many trees are cut down in a forest. What is a likely effect on birds that nest there?", answer: "they lose shelter and nesting space", distractors: ["they become sea animals", "they no longer need food"] },
  { clue: "A pond becomes polluted. What is most likely to happen to fish living there?", answer: "many fish may get sick or die", distractors: ["the fish turn into frogs", "the pond moves to a mountain"] },
  { clue: "More bees visit a garden. What may happen to flowering plants?", answer: "more flowers may get pollinated", distractors: ["the plants stop needing sunlight", "all insects leave the garden"] },
  { clue: "A long drought dries up a grassland. What may happen to grazing animals?", answer: "they may have less food and water", distractors: ["they become trees", "they stop needing air"] },
];
const REVISION_CHOICE_FACTS = [
  { clue: "Pick the clearest sentence.", answer: "The storm was loud and rough.", distractors: ["The storm loud rough.", "Rough loud was the storm."] },
  { clue: "Pick the clearest sentence.", answer: "Mina packed her notebook before the trip.", distractors: ["Mina notebook before packed trip.", "Packed Mina trip before notebook."] },
  { clue: "Pick the best revision.", answer: "The red kite drifted across the bright sky.", distractors: ["Kite sky bright drifted red the.", "The kite red sky."] },
  { clue: "Pick the sentence with the strongest detail.", answer: "The robot sorted tiny screws into labeled trays.", distractors: ["The robot did stuff.", "The robot was there."] },
];
const HISTORICAL_CAUSE_FACTS = [
  { clue: "A town builds canals so farmers can move crops faster. What is a likely effect?", answer: "trade becomes easier", distractors: ["winter stops happening", "mountains disappear"] },
  { clue: "A community prints warning posters before a storm. What is a likely effect?", answer: "more people know how to prepare", distractors: ["the storm changes direction", "time stops for the town"] },
  { clue: "A ruler raises taxes on imported goods. What may merchants do next?", answer: "charge more money for those goods", distractors: ["stop using roads forever", "move the ocean inland"] },
  { clue: "A new railroad connects two cities. What is a likely effect?", answer: "people and products can travel faster", distractors: ["the cities switch places", "all horses disappear"] },
];
const AUTHOR_CLAIM_FACTS = [
  { clue: "The article says school gardens improve lunches because they provide fresh vegetables. What is the author's claim?", answer: "school gardens can improve lunches", distractors: ["all lunches should be green", "vegetables only grow indoors"] },
  { clue: "A writer argues that bike lanes make neighborhoods safer for riders. What is the author's claim?", answer: "bike lanes can improve safety", distractors: ["every street should close to cars", "helmets are made of paper"] },
  { clue: "The essay says reusable bottles cut down on plastic waste. What is the author's claim?", answer: "reusable bottles can reduce waste", distractors: ["plastic disappears by magic", "all water should taste the same"] },
  { clue: "The report explains that reading daily builds vocabulary. What is the author's claim?", answer: "daily reading helps vocabulary grow", distractors: ["books only matter in school", "words never change meaning"] },
];
const THEME_ANALYSIS_FACTS = [
  { clue: "Nia kept practicing the violin even when the song was hard. She smiled when she finally played it well. What theme fits best?", answer: "persistence helps people grow", distractors: ["luck solves every problem", "mistakes should always end a project"] },
  { clue: "Jalen shared the last flashlight so the whole team could finish the cave walk together. What theme fits best?", answer: "teamwork can help everyone succeed", distractors: ["working alone is always best", "flashlights fix every challenge"] },
  { clue: "Amara apologized, repaired the broken model, and earned back her friend's trust. What theme fits best?", answer: "responsibility can rebuild trust", distractors: ["truth never matters", "projects should be thrown away after one mistake"] },
  { clue: "Rui listened to many opinions before choosing a plan for the class garden. What theme fits best?", answer: "good decisions can come from listening carefully", distractors: ["the loudest voice is always right", "plans should never change"] },
];
const FORCE_MOTION_FACTS = [
  { clue: "A soccer ball slows down on grass because of...", answer: "friction", distractors: ["orbit", "evaporation"] },
  { clue: "A heavier push makes a scooter start moving faster because of...", answer: "greater force", distractors: ["less gravity", "less sunlight"] },
  { clue: "A seat belt helps when a car stops suddenly because it changes your...", answer: "motion", distractors: ["shadow", "temperature"] },
  { clue: "A ramp helps move a box upward with less effort because it changes the...", answer: "amount of force needed", distractors: ["color of the box", "weather outside"] },
];
const ECOSYSTEM_EVIDENCE_FACTS = [
  { clue: "The frog population drops after pond pollution rises. What does the evidence suggest?", answer: "the polluted water is harming the frogs", distractors: ["frogs learned to fly away to space", "the pond became a volcano"] },
  { clue: "More wildflowers bloom after bees return to a field. What does the evidence suggest?", answer: "pollinators help many plants reproduce", distractors: ["flowers only grow at night", "bees turn into petals"] },
  { clue: "A grassland loses many rabbits and then the fox population drops too. What does the evidence suggest?", answer: "predators depend on prey for food", distractors: ["foxes only eat rocks", "rabbits became weather clouds"] },
  { clue: "Water birds leave a wetland after the water level drops for months. What does the evidence suggest?", answer: "habitat changes can push animals to move", distractors: ["birds stop needing water", "wetlands turn into planets"] },
];
const EARTH_PROCESS_FACTS = [
  { clue: "Running water breaks rock into smaller pieces over time. What process is this?", answer: "erosion", distractors: ["condensation", "photosynthesis"] },
  { clue: "Melted rock cools and hardens into new rock. What process happened?", answer: "cooling and solidifying", distractors: ["migration", "pollination"] },
  { clue: "Layers of sand and mud press together for a long time. What may form?", answer: "sedimentary rock", distractors: ["a rainbow", "a thunderstorm"] },
  { clue: "Heat and pressure deep underground change rock without melting it. What kind of rock forms?", answer: "metamorphic rock", distractors: ["liquid rock", "plastic rock"] },
];
const MAP_SCALE_FACTS = [
  { clue: "A map scale says 1 inch = 10 miles. Two towns are 3 inches apart on the map. About how far apart are they?", answer: "30 miles", distractors: ["13 miles", "300 miles"] },
  { clue: "A trail map says 1 centimeter = 2 kilometers. The lake is 4 centimeters from camp. About how far is it?", answer: "8 kilometers", distractors: ["6 kilometers", "42 kilometers"] },
  { clue: "A park map uses 1 square to stand for 5 meters. A path covers 6 squares. About how long is it?", answer: "30 meters", distractors: ["11 meters", "56 meters"] },
  { clue: "A road atlas says 1 inch = 25 miles. A city is 2 inches away. About how far is it?", answer: "50 miles", distractors: ["27 miles", "250 miles"] },
];
const POPULATION_PATTERN_FACTS = [
  { clue: "Why do many cities grow near rivers or coasts?", answer: "people can trade and travel more easily", distractors: ["the moon is lower there", "mountains disappear there"] },
  { clue: "Why might fewer people live in a very dry desert?", answer: "water is harder to find", distractors: ["deserts have no sunlight", "roads cannot exist there"] },
  { clue: "Why do some towns grow near factories or ports?", answer: "jobs and shipping can attract people", distractors: ["gravity is weaker there", "clouds never move there"] },
  { clue: "Why do mountain villages often stay smaller than big plains cities?", answer: "steep land can limit building and transport", distractors: ["mountains stop all weather", "people cannot breathe on mountains"] },
];
const CONSTITUTION_PRINCIPLES_FACTS = [
  { clue: "Why do democracies separate powers across branches of government?", answer: "to prevent one group from controlling everything", distractors: ["to make laws secret", "to cancel elections"] },
  { clue: "Why are basic rights written into important laws or constitutions?", answer: "to protect people from unfair treatment", distractors: ["to make school longer", "to stop communities from voting"] },
  { clue: "Why do courts review whether government actions follow the law?", answer: "to check that power is used fairly", distractors: ["to choose sports winners", "to write weather reports"] },
  { clue: "Why do constitutions describe how leaders are chosen?", answer: "to set clear rules for government", distractors: ["to erase all disagreements", "to stop people from learning history"] },
];
const MEDIA_CITIZENSHIP_FACTS = [
  { clue: "Before sharing a breaking story online, what should a responsible citizen do first?", answer: "check whether the source is trustworthy", distractors: ["share it faster than everyone else", "change the facts to sound exciting"] },
  { clue: "A headline seems shocking. What is the best next step?", answer: "read more and compare other reliable sources", distractors: ["believe it without checking", "post it with a made-up photo"] },
  { clue: "Why should people look for the date on an article?", answer: "older information may no longer be accurate", distractors: ["dates only matter in science", "articles without dates are always jokes"] },
  { clue: "What is a clue that a source may be weak?", answer: "it makes big claims but gives no evidence", distractors: ["it uses full sentences", "it names the author"] },
];
const ARGUMENT_EVIDENCE_FACTS = [
  { clue: "Claim: Students should have more time for recess. Which evidence best supports the claim?", answer: "A study showed students focused better after extra activity breaks.", distractors: ["One student likes purple swings.", "The gym floor was cleaned on Friday."] },
  { clue: "Claim: The town should plant more trees. Which evidence best supports the claim?", answer: "Trees can lower street temperatures and provide shade.", distractors: ["Leaves are interesting shapes.", "Some people own green backpacks."] },
  { clue: "Claim: The library should stay open later. Which evidence best supports the claim?", answer: "More families could visit after work and school hours.", distractors: ["Libraries have many shelves.", "Books come in many sizes."] },
  { clue: "Claim: Reusable lunch trays are a good idea. Which evidence best supports the claim?", answer: "They can reduce the amount of trash the school throws away.", distractors: ["Some trays are blue.", "Students also eat fruit at lunch."] },
];
const REVISION_PRECISION_FACTS = [
  { clue: "Choose the more precise sentence.", answer: "The snow leopard padded across the icy rocks.", distractors: ["The animal moved.", "It went and was there."] },
  { clue: "Choose the stronger revision.", answer: "The robot sorted tiny screws into labeled trays.", distractors: ["The robot did stuff.", "The machine was okay."] },
  { clue: "Choose the sentence with the clearest detail.", answer: "Warm steam curled above the cocoa mug.", distractors: ["There was a mug.", "The drink happened."] },
  { clue: "Choose the most vivid revision.", answer: "The red kite snapped in the windy sky.", distractors: ["The kite was there.", "The kite did a thing."] },
];
const SOURCE_ANALYSIS_FACTS = [
  { clue: "A diary written by a child during a migration is what kind of source?", answer: "primary source", distractors: ["future source", "fiction label"] },
  { clue: "A textbook chapter written years later about a war is what kind of source?", answer: "secondary source", distractors: ["primary source", "secret source"] },
  { clue: "Why might historians compare two sources about the same event?", answer: "to check different viewpoints and details", distractors: ["to make the event happen again", "to remove all dates from history"] },
  { clue: "What makes a photograph from the time of an event useful to historians?", answer: "it can show evidence from that moment", distractors: ["it predicts the future", "it proves every opinion is true"] },
];

const SKILL_SPECS = [
  {
    code: "letter-a-recognition",
    module: "english",
    subject: "early-literacy",
    launch_band: "PREK",
    display_name: "Letter A Recognition",
    description: "Identify the uppercase letter A and connect it to familiar A words.",
    difficulty_floor: 1,
    difficulty_ceiling: 2,
    target_count: 1900,
    generator: "letter",
    params: { letter: "A", words: PREK_A_WORDS, distractors: ["B", "D", "H", "M", "O", "R", "P", "U"] },
  },
  {
    code: "letter-b-recognition",
    module: "english",
    subject: "early-literacy",
    launch_band: "PREK",
    display_name: "Letter B Recognition",
    description: "Identify the uppercase letter B and connect it to familiar B words.",
    difficulty_floor: 1,
    difficulty_ceiling: 2,
    target_count: 1900,
    generator: "letter",
    params: { letter: "B", words: PREK_B_WORDS, distractors: ["D", "E", "H", "P", "R", "M", "S", "U"] },
  },
  {
    code: "rhyme-match",
    module: "english",
    subject: "early-literacy",
    launch_band: "PREK",
    display_name: "Rhyme Match",
    description: "Choose the word that rhymes with a simple spoken word.",
    difficulty_floor: 1,
    difficulty_ceiling: 2,
    target_count: 1900,
    generator: "rhyme",
  },
  {
    code: "count-to-3",
    module: "math",
    subject: "math",
    launch_band: "PREK",
    display_name: "Count to 3",
    description: "Count a visible set of up to three objects.",
    difficulty_floor: 1,
    difficulty_ceiling: 2,
    target_count: 2000,
    generator: "count",
    params: { numbers: [1, 2, 3] },
  },
  {
    code: "count-to-5",
    module: "math",
    subject: "math",
    launch_band: "PREK",
    display_name: "Count to 5",
    description: "Count a visible set of up to five objects.",
    difficulty_floor: 1,
    difficulty_ceiling: 2,
    target_count: 2000,
    generator: "count",
    params: { numbers: [2, 3, 4, 5] },
  },
  {
    code: "shape-circle",
    module: "math",
    subject: "math",
    launch_band: "PREK",
    display_name: "Recognize Circles",
    description: "Identify circles from common everyday objects.",
    difficulty_floor: 1,
    difficulty_ceiling: 2,
    target_count: 2000,
    generator: "shape",
    params: { shape: "circle", objects: CIRCLE_OBJECTS, distractors: ["triangle", "square"] },
  },
  {
    code: "shape-triangle",
    module: "math",
    subject: "math",
    launch_band: "PREK",
    display_name: "Recognize Triangles",
    description: "Identify triangles from common everyday objects.",
    difficulty_floor: 1,
    difficulty_ceiling: 2,
    target_count: 2000,
    generator: "shape",
    params: { shape: "triangle", objects: TRIANGLE_OBJECTS, distractors: ["circle", "square"] },
  },
  {
    code: "bigger-smaller",
    module: "math",
    subject: "math",
    launch_band: "PREK",
    display_name: "Bigger or Smaller",
    description: "Compare simple quantities and choose the bigger or smaller group.",
    difficulty_floor: 1,
    difficulty_ceiling: 2,
    target_count: 2000,
    generator: "bigger-smaller",
  },
  {
    code: "color-recognition",
    module: "world-knowledge",
    subject: "world-knowledge",
    launch_band: "PREK",
    display_name: "Color Recognition",
    description: "Name common colors using familiar objects and scenes.",
    difficulty_floor: 1,
    difficulty_ceiling: 2,
    target_count: 1300,
    generator: "color",
  },
  {
    code: "land-water-basics",
    module: "geography",
    subject: "geography",
    launch_band: "PREK",
    display_name: "Land and Water Basics",
    description: "Sort familiar animals and vehicles by whether they belong on land, water, or in the sky.",
    difficulty_floor: 1,
    difficulty_ceiling: 2,
    target_count: 2300,
    generator: "land-water",
  },
  {
    code: "place-clue-basics",
    module: "geography",
    subject: "geography",
    launch_band: "PREK",
    display_name: "Place Clue Basics",
    description: "Use simple place clues to identify beaches, forests, parks, farms, and other settings.",
    difficulty_floor: 1,
    difficulty_ceiling: 2,
    target_count: 2300,
    generator: "place-clue",
  },
  {
    code: "community-helper-basics",
    module: "civics",
    subject: "civics",
    launch_band: "PREK",
    display_name: "Community Helper Basics",
    description: "Identify the people who help a community work safely and smoothly.",
    difficulty_floor: 1,
    difficulty_ceiling: 2,
    target_count: 1700,
    generator: "community-helper",
  },
  {
    code: "safe-choice-basics",
    module: "civics",
    subject: "civics",
    launch_band: "PREK",
    display_name: "Safe Choice Basics",
    description: "Choose safe, kind, and fair actions in simple community and classroom situations.",
    difficulty_floor: 1,
    difficulty_ceiling: 2,
    target_count: 1700,
    generator: "safe-choice",
  },
  {
    code: "weather-basics",
    module: "science",
    subject: "science",
    launch_band: "PREK",
    display_name: "Weather Basics",
    description: "Match simple weather clues to rainy, sunny, windy, snowy, and stormy conditions.",
    difficulty_floor: 1,
    difficulty_ceiling: 2,
    target_count: 1500,
    generator: "weather",
  },
  {
    code: "short-a-sound",
    module: "english",
    subject: "phonics",
    launch_band: "K1",
    display_name: "Short A Sound",
    description: "Identify words with the short a vowel sound in decodable and familiar vocabulary.",
    difficulty_floor: 2,
    difficulty_ceiling: 3,
    target_count: 1800,
    generator: "short-vowel",
    params: { sound: "short a", words: SHORT_A_WORDS, wrongPools: [SHORT_E_WORDS, SHORT_I_WORDS] },
  },
  {
    code: "short-e-sound",
    module: "english",
    subject: "phonics",
    launch_band: "K1",
    display_name: "Short E Sound",
    description: "Identify words with the short e vowel sound in decodable and familiar vocabulary.",
    difficulty_floor: 2,
    difficulty_ceiling: 3,
    target_count: 1800,
    generator: "short-vowel",
    params: { sound: "short e", words: SHORT_E_WORDS, wrongPools: [SHORT_A_WORDS, SHORT_I_WORDS] },
  },
  {
    code: "short-i-sound",
    module: "english",
    subject: "phonics",
    launch_band: "K1",
    display_name: "Short I Sound",
    description: "Identify words with the short i vowel sound in decodable and familiar vocabulary.",
    difficulty_floor: 2,
    difficulty_ceiling: 3,
    target_count: 1800,
    generator: "short-vowel",
    params: { sound: "short i", words: SHORT_I_WORDS, wrongPools: [SHORT_A_WORDS, SHORT_E_WORDS] },
  },
  {
    code: "decodable-cvc-word",
    module: "english",
    subject: "reading",
    launch_band: "K1",
    display_name: "Decode CVC Word",
    description: "Read and select short consonant-vowel-consonant words with growing independence.",
    difficulty_floor: 2,
    difficulty_ceiling: 3,
    target_count: 1800,
    generator: "word-pick",
    params: { words: [...SHORT_A_WORDS, ...SHORT_E_WORDS, ...SHORT_I_WORDS] },
  },
  {
    code: "read-simple-word",
    module: "english",
    subject: "reading",
    launch_band: "K1",
    display_name: "Read Simple Word",
    description: "Select high-frequency and concrete words that early readers can recognize quickly.",
    difficulty_floor: 2,
    difficulty_ceiling: 3,
    target_count: 1800,
    generator: "word-pick",
    params: { words: SIMPLE_WORDS },
  },
  {
    code: "sight-words-basic",
    module: "english",
    subject: "reading",
    launch_band: "K1",
    display_name: "Basic Sight Words",
    description: "Recognize common sight words automatically and accurately.",
    difficulty_floor: 2,
    difficulty_ceiling: 3,
    target_count: 1800,
    generator: "word-pick",
    params: { words: SIGHT_WORDS },
  },
  {
    code: "add-to-10",
    module: "math",
    subject: "math",
    launch_band: "K1",
    display_name: "Addition to 10",
    description: "Solve one-step addition problems within 10 using pictures, stories, and number sentences.",
    difficulty_floor: 2,
    difficulty_ceiling: 3,
    target_count: 2300,
    generator: "add-within-10",
  },
  {
    code: "subtract-from-10",
    module: "math",
    subject: "math",
    launch_band: "K1",
    display_name: "Subtract from 10",
    description: "Solve one-step subtraction problems within 10 using concrete stories and number sentences.",
    difficulty_floor: 2,
    difficulty_ceiling: 3,
    target_count: 2300,
    generator: "subtract-within-10",
  },
  {
    code: "number-bonds-to-5",
    module: "math",
    subject: "math",
    launch_band: "K1",
    display_name: "Number Bonds to 5",
    description: "Find missing parts that make 5 and build early part-whole reasoning.",
    difficulty_floor: 2,
    difficulty_ceiling: 3,
    target_count: 2300,
    generator: "number-bonds",
  },
  {
    code: "map-symbol-basics",
    module: "geography",
    subject: "geography",
    launch_band: "K1",
    display_name: "Map Symbol Basics",
    description: "Read simple map symbols and match them to familiar community places.",
    difficulty_floor: 2,
    difficulty_ceiling: 3,
    target_count: 1800,
    generator: "map-symbols",
  },
  {
    code: "landform-clues",
    module: "geography",
    subject: "geography",
    launch_band: "K1",
    display_name: "Landform Clues",
    description: "Use simple clues to identify rivers, mountains, lakes, beaches, and other landforms.",
    difficulty_floor: 2,
    difficulty_ceiling: 3,
    target_count: 1800,
    generator: "landform-clues",
  },
  {
    code: "community-services-basics",
    module: "civics",
    subject: "civics",
    launch_band: "K1",
    display_name: "Community Services Basics",
    description: "Connect community places and workers to the help they provide.",
    difficulty_floor: 2,
    difficulty_ceiling: 3,
    target_count: 1850,
    generator: "community-services",
  },
  {
    code: "rules-and-fairness",
    module: "civics",
    subject: "civics",
    launch_band: "K1",
    display_name: "Rules and Fairness",
    description: "Choose fair actions and understand why communities use shared rules.",
    difficulty_floor: 2,
    difficulty_ceiling: 3,
    target_count: 1850,
    generator: "fairness",
  },
  {
    code: "weather-patterns",
    module: "science",
    subject: "science",
    launch_band: "K1",
    display_name: "Weather Patterns",
    description: "Use simple weather clues and matching objects to identify common weather conditions.",
    difficulty_floor: 2,
    difficulty_ceiling: 3,
    target_count: 1400,
    generator: "weather",
  },
  {
    code: "sentence-complete-basics",
    module: "writing",
    subject: "writing",
    launch_band: "K1",
    display_name: "Complete the Sentence",
    description: "Choose the word that makes a simple sentence clear and complete.",
    difficulty_floor: 2,
    difficulty_ceiling: 3,
    target_count: 1400,
    generator: "sentence-completion",
  },
  {
    code: "past-present-basics",
    module: "history",
    subject: "history",
    launch_band: "K1",
    display_name: "Past and Present Basics",
    description: "Sort simple clues into past, present, and future time ideas.",
    difficulty_floor: 2,
    difficulty_ceiling: 3,
    target_count: 1400,
    generator: "past-present",
  },
  {
    code: "main-idea",
    module: "english",
    subject: "reading",
    launch_band: "G23",
    display_name: "Find Main Idea",
    description: "Read short informational or narrative passages and identify what they are mostly about.",
    difficulty_floor: 3,
    difficulty_ceiling: 4,
    target_count: 1800,
    generator: "main-idea",
  },
  {
    code: "cause-effect",
    module: "english",
    subject: "reading",
    launch_band: "G23",
    display_name: "Cause and Effect",
    description: "Explain what happened first and what happened because of it in short passages.",
    difficulty_floor: 3,
    difficulty_ceiling: 4,
    target_count: 1800,
    generator: "cause-effect",
  },
  {
    code: "add-3-digit",
    module: "math",
    subject: "math",
    launch_band: "G23",
    display_name: "Add 3-Digit Numbers",
    description: "Solve three-digit addition problems with place-value awareness and growing complexity.",
    difficulty_floor: 3,
    difficulty_ceiling: 4,
    target_count: 2200,
    generator: "add-3-digit",
  },
  {
    code: "multiply-3x4",
    module: "math",
    subject: "math",
    launch_band: "G23",
    display_name: "Equal Groups Multiplication",
    description: "Use repeated addition and equal groups to solve multiplication facts.",
    difficulty_floor: 3,
    difficulty_ceiling: 4,
    target_count: 2200,
    generator: "multiplication",
  },
  {
    code: "time-to-hour",
    module: "math",
    subject: "math",
    launch_band: "G23",
    display_name: "Tell Time to the Hour",
    description: "Read analog clocks and connect times to common daily events.",
    difficulty_floor: 3,
    difficulty_ceiling: 4,
    target_count: 2200,
    generator: "time-to-hour",
  },
  {
    code: "skip-count-by-5",
    module: "math",
    subject: "math",
    launch_band: "G23",
    display_name: "Skip Count by 5",
    description: "Continue number patterns that move by fives and connect them to real groups.",
    difficulty_floor: 3,
    difficulty_ceiling: 4,
    target_count: 2200,
    generator: "skip-count",
  },
  {
    code: "compare-numbers",
    module: "math",
    subject: "math",
    launch_band: "G23",
    display_name: "Compare Numbers",
    description: "Compare two- and three-digit numbers using greater than, less than, and equal relationships.",
    difficulty_floor: 3,
    difficulty_ceiling: 4,
    target_count: 2200,
    generator: "compare-numbers",
  },
  {
    code: "pattern-next-item",
    module: "logic",
    subject: "logic",
    launch_band: "G23",
    display_name: "Predict Pattern",
    description: "Find what comes next in repeating and growing patterns.",
    difficulty_floor: 3,
    difficulty_ceiling: 4,
    target_count: 1600,
    generator: "pattern",
  },
  {
    code: "continent-basics",
    module: "geography",
    subject: "geography",
    launch_band: "G23",
    display_name: "Continent Basics",
    description: "Connect countries, landmarks, and animals to major world continents.",
    difficulty_floor: 3,
    difficulty_ceiling: 4,
    target_count: 2900,
    generator: "continents",
  },
  {
    code: "region-climate",
    module: "geography",
    subject: "geography",
    launch_band: "G23",
    display_name: "Region and Climate",
    description: "Use climate and landform clues to reason about world regions.",
    difficulty_floor: 3,
    difficulty_ceiling: 4,
    target_count: 2900,
    generator: "region-climate",
  },
  {
    code: "government-branches-intro",
    module: "civics",
    subject: "civics",
    launch_band: "G23",
    display_name: "Government Branches Intro",
    description: "Recognize the basic jobs of the legislative, executive, and judicial branches.",
    difficulty_floor: 3,
    difficulty_ceiling: 4,
    target_count: 1500,
    generator: "branches-intro",
  },
  {
    code: "citizen-responsibility",
    module: "civics",
    subject: "civics",
    launch_band: "G23",
    display_name: "Citizen Responsibility",
    description: "Choose respectful and responsible actions that support class, school, and community life.",
    difficulty_floor: 3,
    difficulty_ceiling: 4,
    target_count: 1500,
    generator: "citizen-actions",
  },
  {
    code: "life-cycle-basics",
    module: "science",
    subject: "science",
    launch_band: "G23",
    display_name: "Life Cycle Basics",
    description: "Recognize simple life-cycle stages and basic patterns of growth and change.",
    difficulty_floor: 3,
    difficulty_ceiling: 4,
    target_count: 1500,
    generator: "life-cycle",
  },
  {
    code: "paragraph-sequence",
    module: "writing",
    subject: "writing",
    launch_band: "G23",
    display_name: "Paragraph Sequence",
    description: "Put short process or story steps in a sensible order.",
    difficulty_floor: 3,
    difficulty_ceiling: 4,
    target_count: 1500,
    generator: "paragraph-sequence",
  },
  {
    code: "timeline-order",
    module: "history",
    subject: "history",
    launch_band: "G23",
    display_name: "Timeline Order",
    description: "Use first, next, and last thinking to order events on a simple timeline.",
    difficulty_floor: 3,
    difficulty_ceiling: 4,
    target_count: 1500,
    generator: "timeline-order",
  },
  {
    code: "use-context-clues",
    module: "english",
    subject: "reading",
    launch_band: "G45",
    display_name: "Use Context Clues",
    description: "Infer word meanings using sentence-level and paragraph-level clues.",
    difficulty_floor: 4,
    difficulty_ceiling: 5,
    target_count: 1800,
    generator: "context-clues",
  },
  {
    code: "text-evidence",
    module: "english",
    subject: "reading",
    launch_band: "G45",
    display_name: "Find Text Evidence",
    description: "Select the strongest sentence or detail that supports a stated claim.",
    difficulty_floor: 4,
    difficulty_ceiling: 5,
    target_count: 1800,
    generator: "text-evidence",
  },
  {
    code: "inference-making",
    module: "english",
    subject: "reading",
    launch_band: "G45",
    display_name: "Make Inferences",
    description: "Draw logical conclusions from clues that the text implies instead of saying directly.",
    difficulty_floor: 4,
    difficulty_ceiling: 5,
    target_count: 1800,
    generator: "inference",
  },
  {
    code: "compare-fractions",
    module: "math",
    subject: "math",
    launch_band: "G45",
    display_name: "Compare Fractions",
    description: "Compare fractions with shared numerators or denominators and reason about part size.",
    difficulty_floor: 4,
    difficulty_ceiling: 5,
    target_count: 2200,
    generator: "fractions",
  },
  {
    code: "decimal-place-value",
    module: "math",
    subject: "math",
    launch_band: "G45",
    display_name: "Decimal Place Value",
    description: "Identify digits in the tenths and hundredths places and connect them to decimal size.",
    difficulty_floor: 4,
    difficulty_ceiling: 5,
    target_count: 2200,
    generator: "decimals",
  },
  {
    code: "percent-basics",
    module: "math",
    subject: "math",
    launch_band: "G45",
    display_name: "Percent Basics",
    description: "Interpret percents as parts out of 100 and solve one-step percent problems.",
    difficulty_floor: 4,
    difficulty_ceiling: 5,
    target_count: 2200,
    generator: "percents",
  },
  {
    code: "ratio-simple",
    module: "math",
    subject: "math",
    launch_band: "G45",
    display_name: "Simple Ratios",
    description: "Compare two quantities using ratios in words, colon form, and simple contexts.",
    difficulty_floor: 4,
    difficulty_ceiling: 5,
    target_count: 2200,
    generator: "ratios",
  },
  {
    code: "engineering-basics",
    module: "world-knowledge",
    subject: "world-knowledge",
    launch_band: "G45",
    display_name: "Engineering Basics",
    description: "Explain why engineers test, revise, and measure as they solve real problems.",
    difficulty_floor: 4,
    difficulty_ceiling: 5,
    target_count: 1600,
    generator: "engineering",
  },
  {
    code: "latitude-longitude",
    module: "geography",
    subject: "geography",
    launch_band: "G45",
    display_name: "Latitude and Longitude",
    description: "Use coordinate clues to locate positions on a simple global grid.",
    difficulty_floor: 4,
    difficulty_ceiling: 5,
    target_count: 3000,
    generator: "latitude-longitude",
  },
  {
    code: "human-physical-geography",
    module: "geography",
    subject: "geography",
    launch_band: "G45",
    display_name: "Human and Physical Geography",
    description: "Distinguish between natural physical features and features built by people.",
    difficulty_floor: 4,
    difficulty_ceiling: 5,
    target_count: 3000,
    generator: "human-physical",
  },
  {
    code: "government-branches-powers",
    module: "civics",
    subject: "civics",
    launch_band: "G45",
    display_name: "Government Branches and Powers",
    description: "Connect branches of government to powers, checks, and responsibilities.",
    difficulty_floor: 4,
    difficulty_ceiling: 5,
    target_count: 1600,
    generator: "branches-powers",
  },
  {
    code: "election-process",
    module: "civics",
    subject: "civics",
    launch_band: "G45",
    display_name: "Election Process",
    description: "Understand how campaigns, ballots, vote counting, and results work in a basic election process.",
    difficulty_floor: 4,
    difficulty_ceiling: 5,
    target_count: 1600,
    generator: "election-process",
  },
  {
    code: "ecosystem-change",
    module: "science",
    subject: "science",
    launch_band: "G45",
    display_name: "Ecosystem Change",
    description: "Use evidence to predict how plants and animals respond when habitats change.",
    difficulty_floor: 4,
    difficulty_ceiling: 5,
    target_count: 1500,
    generator: "ecosystem-change",
  },
  {
    code: "revision-choice",
    module: "writing",
    subject: "writing",
    launch_band: "G45",
    display_name: "Revision Choice",
    description: "Choose the sentence revision that is clearer, stronger, and more complete.",
    difficulty_floor: 4,
    difficulty_ceiling: 5,
    target_count: 1500,
    generator: "revision-choice",
  },
  {
    code: "historical-cause-effect",
    module: "history",
    subject: "history",
    launch_band: "G45",
    display_name: "Historical Cause and Effect",
    description: "Connect actions in communities and societies to likely historical effects.",
    difficulty_floor: 4,
    difficulty_ceiling: 5,
    target_count: 1500,
    generator: "historical-cause",
  },
  {
    code: "author-claim",
    module: "english",
    subject: "reading",
    launch_band: "G6",
    display_name: "Author Claim",
    description: "Identify the main claim an author is making in a short argument or article excerpt.",
    difficulty_floor: 5,
    difficulty_ceiling: 6,
    target_count: 1500,
    generator: "author-claim",
  },
  {
    code: "theme-analysis",
    module: "english",
    subject: "reading",
    launch_band: "G6",
    display_name: "Theme Analysis",
    description: "Infer the theme of a short scenario and separate it from surface details.",
    difficulty_floor: 5,
    difficulty_ceiling: 6,
    target_count: 1500,
    generator: "theme-analysis",
  },
  {
    code: "integer-number-line",
    module: "math",
    subject: "math",
    launch_band: "G6",
    display_name: "Integers on a Number Line",
    description: "Compare and locate positive and negative numbers on a number line.",
    difficulty_floor: 5,
    difficulty_ceiling: 6,
    target_count: 1900,
    generator: "integer-number-line",
  },
  {
    code: "order-of-operations",
    module: "math",
    subject: "math",
    launch_band: "G6",
    display_name: "Order of Operations",
    description: "Evaluate numeric expressions using parentheses and operation order.",
    difficulty_floor: 5,
    difficulty_ceiling: 6,
    target_count: 1900,
    generator: "order-of-operations",
  },
  {
    code: "simple-equations",
    module: "math",
    subject: "math",
    launch_band: "G6",
    display_name: "Simple Equations",
    description: "Solve one-step equations with a missing value.",
    difficulty_floor: 5,
    difficulty_ceiling: 6,
    target_count: 1900,
    generator: "simple-equations",
  },
  {
    code: "rate-reasoning",
    module: "math",
    subject: "math",
    launch_band: "G6",
    display_name: "Rate Reasoning",
    description: "Use unit-rate style reasoning with simple real-world contexts.",
    difficulty_floor: 5,
    difficulty_ceiling: 6,
    target_count: 1900,
    generator: "rate-reasoning",
  },
  {
    code: "force-motion",
    module: "science",
    subject: "science",
    launch_band: "G6",
    display_name: "Force and Motion",
    description: "Explain common motion situations using ideas like force, friction, and speed change.",
    difficulty_floor: 5,
    difficulty_ceiling: 6,
    target_count: 1500,
    generator: "force-motion",
  },
  {
    code: "ecosystem-evidence",
    module: "science",
    subject: "science",
    launch_band: "G6",
    display_name: "Ecosystem Evidence",
    description: "Use evidence from populations and habitat changes to explain ecosystem patterns.",
    difficulty_floor: 5,
    difficulty_ceiling: 6,
    target_count: 1500,
    generator: "ecosystem-evidence",
  },
  {
    code: "earth-processes",
    module: "science",
    subject: "science",
    launch_band: "G6",
    display_name: "Earth Processes",
    description: "Reason about erosion, rock formation, and change on Earth over time.",
    difficulty_floor: 5,
    difficulty_ceiling: 6,
    target_count: 1500,
    generator: "earth-processes",
  },
  {
    code: "map-scale-data",
    module: "geography",
    subject: "geography",
    launch_band: "G6",
    display_name: "Map Scale and Distance",
    description: "Use map scales to estimate real-world distance and compare locations.",
    difficulty_floor: 5,
    difficulty_ceiling: 6,
    target_count: 1600,
    generator: "map-scale",
  },
  {
    code: "population-patterns",
    module: "geography",
    subject: "geography",
    launch_band: "G6",
    display_name: "Population Patterns",
    description: "Explain why people settle more densely in some places than in others.",
    difficulty_floor: 5,
    difficulty_ceiling: 6,
    target_count: 1600,
    generator: "population-patterns",
  },
  {
    code: "constitution-principles",
    module: "civics",
    subject: "civics",
    launch_band: "G6",
    display_name: "Constitution Principles",
    description: "Connect constitutions, rights, and separated powers to fair government design.",
    difficulty_floor: 5,
    difficulty_ceiling: 6,
    target_count: 1400,
    generator: "constitution-principles",
  },
  {
    code: "media-citizenship",
    module: "civics",
    subject: "civics",
    launch_band: "G6",
    display_name: "Media and Citizenship",
    description: "Check sources, evidence, and credibility before sharing public information.",
    difficulty_floor: 5,
    difficulty_ceiling: 6,
    target_count: 1400,
    generator: "media-citizenship",
  },
  {
    code: "argument-evidence",
    module: "writing",
    subject: "writing",
    launch_band: "G6",
    display_name: "Argument and Evidence",
    description: "Choose the evidence that best supports a stated claim.",
    difficulty_floor: 5,
    difficulty_ceiling: 6,
    target_count: 1400,
    generator: "argument-evidence",
  },
  {
    code: "revision-precision",
    module: "writing",
    subject: "writing",
    launch_band: "G6",
    display_name: "Revision Precision",
    description: "Improve sentence precision by choosing stronger, more vivid wording.",
    difficulty_floor: 5,
    difficulty_ceiling: 6,
    target_count: 1400,
    generator: "revision-precision",
  },
  {
    code: "source-analysis",
    module: "history",
    subject: "history",
    launch_band: "G6",
    display_name: "Source Analysis",
    description: "Distinguish source types and use sourcing clues to reason about historical evidence.",
    difficulty_floor: 5,
    difficulty_ceiling: 6,
    target_count: 1400,
    generator: "source-analysis",
  },
  {
    code: "multi-step-patterns",
    module: "logic",
    subject: "logic",
    launch_band: "G6",
    display_name: "Multi-step Patterns",
    description: "Recognize patterns that change by more than one rule at a time.",
    difficulty_floor: 5,
    difficulty_ceiling: 6,
    target_count: 1300,
    generator: "multi-step-patterns",
  },
];

const GENERATED_EXPLAINERS = [
  {
    explainer_key: "prek_land_water",
    launch_band: "PREK",
    subject: "geography",
    format: "voice-animation",
    misconception: "mixing up land, water, and sky places",
    script: "Think about where each thing belongs. Fish and boats belong in water, cars belong on land, and airplanes go in the sky.",
    media_hint: "split scene showing land, water, and sky",
  },
  {
    explainer_key: "prek_place_clue",
    launch_band: "PREK",
    subject: "geography",
    format: "voice-animation",
    misconception: "missing the place clue",
    script: "Listen for the clue words. Sand and waves point to a beach, and trees all around point to a forest.",
    media_hint: "friendly place cards with clue icons",
  },
  {
    explainer_key: "prek_community_helper",
    launch_band: "PREK",
    subject: "civics",
    format: "voice-animation",
    misconception: "not matching helper to job",
    script: "Community helpers each have a special job. Firefighters put out fires, and doctors help people feel better.",
    media_hint: "community helper parade",
  },
  {
    explainer_key: "prek_safe_choice",
    launch_band: "PREK",
    subject: "civics",
    format: "voice-animation",
    misconception: "choosing unsafe or unkind actions",
    script: "Safe choices help everyone. We walk carefully, wait our turn, and use kind hands.",
    media_hint: "classroom safety checklist",
  },
  {
    explainer_key: "k1_map_symbols",
    launch_band: "K1",
    subject: "geography",
    format: "voice-video",
    misconception: "not connecting map symbols to real places",
    script: "Maps use symbols to stand for places. A tree can mean a park, and a book can mean a library.",
    media_hint: "simple town map with legend",
  },
  {
    explainer_key: "k1_landforms",
    launch_band: "K1",
    subject: "geography",
    format: "voice-video",
    misconception: "mixing up landforms",
    script: "Landforms tell us what a place is like. Rivers flow, mountains rise high, and beaches sit beside water.",
    media_hint: "landform flash cards",
  },
  {
    explainer_key: "k1_community_services",
    launch_band: "K1",
    subject: "civics",
    format: "voice-video",
    misconception: "confusing places and services in a town",
    script: "Each community place helps people in a different way. The library lends books, and the hospital helps when someone is hurt.",
    media_hint: "community service map",
  },
  {
    explainer_key: "k1_fairness",
    launch_band: "K1",
    subject: "civics",
    format: "voice-video",
    misconception: "missing why rules are fair",
    script: "Fair rules help everyone get a turn and stay safe. A fair choice thinks about the whole group, not just one person.",
    media_hint: "turn-taking scene",
  },
  {
    explainer_key: "g23_continents",
    launch_band: "G23",
    subject: "geography",
    format: "voice-video",
    misconception: "mixing up continents",
    script: "Use the clue in the country, landmark, or animal to connect it to the right continent.",
    media_hint: "continent highlight map",
  },
  {
    explainer_key: "g23_region_climate",
    launch_band: "G23",
    subject: "geography",
    format: "voice-video",
    misconception: "not matching climate and region clues",
    script: "Regions have clues like temperature, rainfall, and landforms. Warm and wet can point to a rainforest, while dry can point to a desert.",
    media_hint: "region and climate cards",
  },
  {
    explainer_key: "g23_branches_intro",
    launch_band: "G23",
    subject: "civics",
    format: "voice-video",
    misconception: "mixing branch jobs",
    script: "The legislative branch makes laws, the executive branch carries them out, and the judicial branch explains what the laws mean.",
    media_hint: "three-branch ladder graphic",
  },
  {
    explainer_key: "g23_citizen_actions",
    launch_band: "G23",
    subject: "civics",
    format: "voice-video",
    misconception: "missing responsible community actions",
    script: "Responsible citizens follow rules, care for shared spaces, and participate respectfully.",
    media_hint: "students helping in community scenes",
  },
  {
    explainer_key: "g45_lat_long",
    launch_band: "G45",
    subject: "geography",
    format: "video",
    misconception: "mixing latitude and longitude",
    script: "Latitude lines run east to west and measure north or south. Longitude lines run north to south and measure east or west.",
    media_hint: "global grid overlay",
  },
  {
    explainer_key: "g45_human_physical",
    launch_band: "G45",
    subject: "geography",
    format: "video",
    misconception: "confusing natural and built features",
    script: "Physical features are natural parts of Earth like rivers and mountains. Human features are built by people like bridges and roads.",
    media_hint: "split panel of natural and built features",
  },
  {
    explainer_key: "g45_branches_powers",
    launch_band: "G45",
    subject: "civics",
    format: "video",
    misconception: "mixing powers across branches",
    script: "Each branch has powers and limits. Checks and balances help prevent any one branch from controlling everything.",
    media_hint: "checks and balances diagram",
  },
  {
    explainer_key: "g45_election_process",
    launch_band: "G45",
    subject: "civics",
    format: "video",
    misconception: "missing how voting and counting work",
    script: "In an election, voters compare choices, cast ballots, and then officials count the votes to announce the result.",
    media_hint: "ballot and count board",
  },
  {
    explainer_key: "prek_weather",
    launch_band: "PREK",
    subject: "science",
    format: "voice-animation",
    misconception: "mixing up basic weather conditions",
    script: "Look for weather clues. Umbrellas and raindrops mean rainy, while bright sun and sunglasses mean sunny.",
    media_hint: "weather cards with simple scene clues",
  },
  {
    explainer_key: "k1_weather_patterns",
    launch_band: "K1",
    subject: "science",
    format: "voice-video",
    misconception: "missing common weather clues",
    script: "Weather patterns leave clues. Snowflakes point to snowy weather, and moving leaves can point to a windy day.",
    media_hint: "weekly weather board",
  },
  {
    explainer_key: "k1_sentence_complete",
    launch_band: "K1",
    subject: "writing",
    format: "voice-video",
    misconception: "choosing a word that does not complete the sentence",
    script: "A complete sentence needs a word that makes sense in the idea. Read the whole sentence, then test each choice.",
    media_hint: "sentence strip with choice cards",
  },
  {
    explainer_key: "k1_past_present",
    launch_band: "K1",
    subject: "history",
    format: "voice-video",
    misconception: "confusing past, present, and future",
    script: "Past means it already happened. Present means it is happening now. Future means it will happen later.",
    media_hint: "three-part time arrow",
  },
  {
    explainer_key: "g23_life_cycle",
    launch_band: "G23",
    subject: "science",
    format: "voice-video",
    misconception: "mixing up stages of growth and change",
    script: "Life cycles show how living things grow and change in steps. Use the order of stages to find what comes next.",
    media_hint: "life cycle wheel",
  },
  {
    explainer_key: "g23_paragraph_sequence",
    launch_band: "G23",
    subject: "writing",
    format: "voice-video",
    misconception: "putting ideas in an unclear order",
    script: "Good writing order helps the reader follow each step. Look for clue words like first, next, then, and last.",
    media_hint: "process cards in order",
  },
  {
    explainer_key: "g23_timeline_order",
    launch_band: "G23",
    subject: "history",
    format: "voice-video",
    misconception: "mixing event order on a timeline",
    script: "A timeline puts events in order from earliest to latest. Find the event that happens first before you decide what comes next.",
    media_hint: "simple timeline with arrows",
  },
  {
    explainer_key: "g45_ecosystem_change",
    launch_band: "G45",
    subject: "science",
    format: "video",
    misconception: "missing how habitat changes affect living things",
    script: "When an ecosystem changes, plants and animals often change with it. Look for who loses food, shelter, or a safe place to live.",
    media_hint: "before-and-after habitat scene",
  },
  {
    explainer_key: "g45_revision_choice",
    launch_band: "G45",
    subject: "writing",
    format: "video",
    misconception: "choosing the sentence with weaker wording or structure",
    script: "A strong revision is clear, complete, and smooth to read. Check which choice sounds like a sentence a reader can follow easily.",
    media_hint: "side-by-side sentence edit cards",
  },
  {
    explainer_key: "g45_historical_cause",
    launch_band: "G45",
    subject: "history",
    format: "video",
    misconception: "missing likely effects of an event or decision",
    script: "Cause happens first and effect follows after. Ask what new result would likely happen because of the action in the clue.",
    media_hint: "cause-and-effect timeline",
  },
  {
    explainer_key: "g6_author_claim",
    launch_band: "G6",
    subject: "reading",
    format: "video",
    misconception: "confusing topic, detail, and author claim",
    script: "The claim is the main point the author wants you to believe. Supporting details are the reasons or evidence underneath it.",
    media_hint: "claim and evidence ladder",
  },
  {
    explainer_key: "g6_math_reasoning",
    launch_band: "G6",
    subject: "math",
    format: "video",
    misconception: "missing the structure of pre-algebra reasoning",
    script: "Work one step at a time. Use the operation signs, number line direction, or equation balance to decide what happens next.",
    media_hint: "expression and number line board",
  },
  {
    explainer_key: "g6_science_reasoning",
    launch_band: "G6",
    subject: "science",
    format: "video",
    misconception: "not connecting evidence to a science idea",
    script: "Use the evidence in the clue first. Then match it to the science concept that best explains the change or pattern.",
    media_hint: "evidence to explanation flow chart",
  },
  {
    explainer_key: "g6_geography_data",
    launch_band: "G6",
    subject: "geography",
    format: "video",
    misconception: "missing map scale or settlement clues",
    script: "Map scale turns paper distance into real distance. Population clues usually connect to water, trade, jobs, and easier travel.",
    media_hint: "map scale ruler and city map",
  },
  {
    explainer_key: "g6_civics_principles",
    launch_band: "G6",
    subject: "civics",
    format: "video",
    misconception: "missing why institutions use checks, rights, and source checks",
    script: "Civic systems use rules, rights, and source checking to protect fair decision-making. Ask what choice protects people and reliable information.",
    media_hint: "government and media trust checklist",
  },
  {
    explainer_key: "g6_writing_argument",
    launch_band: "G6",
    subject: "writing",
    format: "video",
    misconception: "choosing weak evidence or vague revision language",
    script: "Strong evidence directly supports the claim, and strong revision uses precise words the reader can picture clearly.",
    media_hint: "claim, evidence, and revision board",
  },
  {
    explainer_key: "g6_source_analysis",
    launch_band: "G6",
    subject: "history",
    format: "video",
    misconception: "confusing source type and usefulness",
    script: "Primary sources come from the time being studied. Secondary sources explain or analyze later, often using many primary sources.",
    media_hint: "source sorting cards",
  },
  {
    explainer_key: "g6_logic_patterns",
    launch_band: "G6",
    subject: "logic",
    format: "video",
    misconception: "following only one rule in a multi-step pattern",
    script: "Some patterns change in two ways at once. Check how the number changes first, then test whether a second rule also repeats.",
    media_hint: "dual-rule pattern board",
  },
];

const CONTENT_TEMPLATES = [
  {
    template_key: "tap-letter-choice",
    module: "english",
    subject: "early-literacy",
    launch_band: "PREK",
    modality: "tap",
    reading_load: "low",
    prompt_pattern: "Tap the correct letter or the first letter in a familiar word.",
    answer_pattern: "single choice from 3 options",
    explanation_pattern: "voice-led letter reminder with simple object association",
  },
  {
    template_key: "count-visible-objects",
    module: "math",
    subject: "math",
    launch_band: "PREK",
    modality: "tap",
    reading_load: "low",
    prompt_pattern: "Count visible objects and choose the matching number.",
    answer_pattern: "single number choice from 3 options",
    explanation_pattern: "slow count-along with animated objects",
  },
  {
    template_key: "prek-place-clue",
    module: "geography",
    subject: "geography",
    launch_band: "PREK",
    modality: "tap",
    reading_load: "low",
    prompt_pattern: "Use a simple place clue to choose a beach, forest, park, or other location.",
    answer_pattern: "single choice from 3 place options",
    explanation_pattern: "friendly clue repeat with scene icons",
  },
  {
    template_key: "prek-safe-choice",
    module: "civics",
    subject: "civics",
    launch_band: "PREK",
    modality: "tap",
    reading_load: "low",
    prompt_pattern: "Pick the safe or kind action in a simple scenario.",
    answer_pattern: "single choice from 3 actions",
    explanation_pattern: "coach voice models the safe choice",
  },
  {
    template_key: "prek-weather-clue",
    module: "science",
    subject: "science",
    launch_band: "PREK",
    modality: "tap",
    reading_load: "low",
    prompt_pattern: "Use a simple weather clue to choose rainy, sunny, windy, or snowy weather.",
    answer_pattern: "single choice from 3 weather options",
    explanation_pattern: "weather clue repeat with icons and outfit hints",
  },
  {
    template_key: "phonics-word-pick",
    module: "english",
    subject: "phonics",
    launch_band: "K1",
    modality: "tap",
    reading_load: "medium",
    prompt_pattern: "Pick the word with the target sound.",
    answer_pattern: "single choice from 3 words",
    explanation_pattern: "spoken sound-out with mascot example",
  },
  {
    template_key: "simple-addition-scoreboard",
    module: "math",
    subject: "math",
    launch_band: "K1",
    modality: "tap",
    reading_load: "medium",
    prompt_pattern: "Solve a one-step addition, subtraction, or number bond problem.",
    answer_pattern: "single number choice from 3 options",
    explanation_pattern: "count-on or count-back with score fill animation",
  },
  {
    template_key: "k1-map-symbols",
    module: "geography",
    subject: "geography",
    launch_band: "K1",
    modality: "tap",
    reading_load: "medium",
    prompt_pattern: "Read a simple map symbol and match it to a community place.",
    answer_pattern: "single choice from 3 place options",
    explanation_pattern: "mini-map legend callout",
  },
  {
    template_key: "k1-fairness-choice",
    module: "civics",
    subject: "civics",
    launch_band: "K1",
    modality: "tap",
    reading_load: "medium",
    prompt_pattern: "Choose the fair action or the rule that helps a group work together.",
    answer_pattern: "single choice from 3 actions",
    explanation_pattern: "teacher-style fairness reminder",
  },
  {
    template_key: "k1-sentence-complete",
    module: "writing",
    subject: "writing",
    launch_band: "K1",
    modality: "tap",
    reading_load: "medium",
    prompt_pattern: "Choose the word that completes a short sentence.",
    answer_pattern: "single choice from 3 words",
    explanation_pattern: "read-the-whole-sentence guidance",
  },
  {
    template_key: "k1-time-clue",
    module: "history",
    subject: "history",
    launch_band: "K1",
    modality: "tap",
    reading_load: "medium",
    prompt_pattern: "Use a clue to choose past, present, or future.",
    answer_pattern: "single choice from 3 time ideas",
    explanation_pattern: "three-part time arrow with examples",
  },
  {
    template_key: "paragraph-main-idea",
    module: "english",
    subject: "reading",
    launch_band: "G23",
    modality: "tap",
    reading_load: "medium",
    prompt_pattern: "Read a short paragraph and choose its main idea or cause/effect relationship.",
    answer_pattern: "single choice from 3 summaries",
    explanation_pattern: "mission recap showing detail versus main idea",
  },
  {
    template_key: "g23-math-practice",
    module: "math",
    subject: "math",
    launch_band: "G23",
    modality: "tap",
    reading_load: "medium",
    prompt_pattern: "Solve a grade-band math fact, pattern, comparison, or time item.",
    answer_pattern: "single choice from 3 options",
    explanation_pattern: "visual reasoning and step-by-step breakdown",
  },
  {
    template_key: "g23-continent-clue",
    module: "geography",
    subject: "geography",
    launch_band: "G23",
    modality: "tap",
    reading_load: "medium",
    prompt_pattern: "Use a country, landmark, or climate clue to identify the right world region.",
    answer_pattern: "single choice from 3 geography options",
    explanation_pattern: "map-based continent or climate cue",
  },
  {
    template_key: "g23-civics-intro",
    module: "civics",
    subject: "civics",
    launch_band: "G23",
    modality: "tap",
    reading_load: "medium",
    prompt_pattern: "Choose the branch or citizen action that best fits the clue.",
    answer_pattern: "single choice from 3 civics options",
    explanation_pattern: "simple civic role reminder",
  },
  {
    template_key: "g23-science-cycle",
    module: "science",
    subject: "science",
    launch_band: "G23",
    modality: "tap",
    reading_load: "medium",
    prompt_pattern: "Use life-cycle or change clues to identify the best answer.",
    answer_pattern: "single choice from 3 science options",
    explanation_pattern: "cycle wheel or stage order reminder",
  },
  {
    template_key: "g23-sequence-order",
    module: "writing",
    subject: "writing",
    launch_band: "G23",
    modality: "tap",
    reading_load: "medium",
    prompt_pattern: "Choose the sentence or event that comes first, next, or last.",
    answer_pattern: "single choice from 3 sequence options",
    explanation_pattern: "first-next-last organizer",
  },
  {
    template_key: "g45-reading-reasoning",
    module: "english",
    subject: "reading",
    launch_band: "G45",
    modality: "tap",
    reading_load: "high",
    prompt_pattern: "Use context clues, inference, or evidence selection to support comprehension.",
    answer_pattern: "single choice from 3 meanings or claims",
    explanation_pattern: "highlight clue words and evidence lines",
  },
  {
    template_key: "g45-math-analysis",
    module: "math",
    subject: "math",
    launch_band: "G45",
    modality: "tap",
    reading_load: "medium",
    prompt_pattern: "Compare fractions, decimals, percents, or ratios using one-step reasoning.",
    answer_pattern: "single choice from 3 options",
    explanation_pattern: "number model with comparison reasoning",
  },
  {
    template_key: "g45-lat-long",
    module: "geography",
    subject: "geography",
    launch_band: "G45",
    modality: "tap",
    reading_load: "high",
    prompt_pattern: "Use coordinate, map, or feature clues to identify the best geography answer.",
    answer_pattern: "single choice from 3 options",
    explanation_pattern: "grid or feature classification walkthrough",
  },
  {
    template_key: "g45-civics-process",
    module: "civics",
    subject: "civics",
    launch_band: "G45",
    modality: "tap",
    reading_load: "high",
    prompt_pattern: "Match powers, checks, or election steps to the correct civics concept.",
    answer_pattern: "single choice from 3 civics options",
    explanation_pattern: "plain-language civics ladder with process highlights",
  },
  {
    template_key: "g45-science-change",
    module: "science",
    subject: "science",
    launch_band: "G45",
    modality: "tap",
    reading_load: "high",
    prompt_pattern: "Use habitat or evidence clues to predict ecosystem change.",
    answer_pattern: "single choice from 3 evidence-based options",
    explanation_pattern: "before-and-after ecosystem walkthrough",
  },
  {
    template_key: "g45-revision-history",
    module: "writing",
    subject: "writing",
    launch_band: "G45",
    modality: "tap",
    reading_load: "high",
    prompt_pattern: "Choose the clearest revision or likely historical effect.",
    answer_pattern: "single choice from 3 options",
    explanation_pattern: "revision checklist or cause-effect chain",
  },
  {
    template_key: "g6-argument-reading",
    module: "english",
    subject: "reading",
    launch_band: "G6",
    modality: "tap",
    reading_load: "high",
    prompt_pattern: "Identify a claim, theme, or argument idea from a short scenario or excerpt.",
    answer_pattern: "single choice from 3 analytical options",
    explanation_pattern: "claim-theme distinction with evidence cues",
  },
  {
    template_key: "g6-math-reasoning",
    module: "math",
    subject: "math",
    launch_band: "G6",
    modality: "tap",
    reading_load: "high",
    prompt_pattern: "Solve integer, equation, order-of-operations, or rate reasoning items.",
    answer_pattern: "single choice from 3 math options",
    explanation_pattern: "step-by-step algebra and number line reasoning",
  },
  {
    template_key: "g6-science-evidence",
    module: "science",
    subject: "science",
    launch_band: "G6",
    modality: "tap",
    reading_load: "high",
    prompt_pattern: "Use evidence to explain force, ecosystem, or Earth-process ideas.",
    answer_pattern: "single choice from 3 science explanations",
    explanation_pattern: "evidence-to-concept walkthrough",
  },
  {
    template_key: "g6-geography-civics",
    module: "geography",
    subject: "geography",
    launch_band: "G6",
    modality: "tap",
    reading_load: "high",
    prompt_pattern: "Interpret map scale, population, or institution clues to select the best answer.",
    answer_pattern: "single choice from 3 analytical options",
    explanation_pattern: "map-data or civic-principle scaffold",
  },
  {
    template_key: "g6-writing-history",
    module: "writing",
    subject: "writing",
    launch_band: "G6",
    modality: "tap",
    reading_load: "high",
    prompt_pattern: "Choose the strongest evidence, most precise revision, or best source interpretation.",
    answer_pattern: "single choice from 3 evidence or revision options",
    explanation_pattern: "claim-evidence ladder or source analysis scaffold",
  },
];

const TOP_UP_PREFIXES = {
  PREK: ["New clue:", "Try another:", "One more:", "Next turn:", "Look again:", "Fresh clue:", "Another try:", "New picture clue:"],
  K1: ["Quick check:", "New round:", "Try this:", "Next clue:", "Practice turn:", "Sound check:", "Read this one:", "Skill turn:"],
  G23: ["Practice set:", "New challenge:", "Next clue:", "Skill check:", "Another prompt:", "Warm-up check:", "Review step:", "Quest practice:"],
  G45: ["Analysis check:", "Stretch prompt:", "Next challenge:", "Practice set:", "Reason it out:", "Skill review:", "Concept check:", "Precision round:"],
  G6: ["Analyst check:", "Advanced prompt:", "Cross-skill round:", "Proof check:", "Reasoning set:", "Precision pass:", "Extension round:", "Concept ladder:"],
};
const TOP_UP_SUFFIXES = {
  PREK: ["Tap the best answer.", "Look carefully.", "You can do it.", "Listen for the clue.", "Point to the best one.", "Use the picture clue.", "Pick the best match.", "Take your time."],
  K1: ["Read each choice.", "Think about the sound.", "Count carefully.", "Pick the best answer.", "Check each card.", "Use the clue words.", "Go one step at a time.", "Choose carefully."],
  G23: ["Use the clue words.", "Check the pattern.", "Think step by step.", "Choose the strongest answer.", "Look at every detail.", "Use what you know.", "Read the choices twice.", "Solve it carefully."],
  G45: ["Use your evidence.", "Reason through the options.", "Check the concept carefully.", "Choose the strongest answer.", "Analyze each choice.", "Look for the best proof.", "Keep the logic tight.", "Show your precision."],
  G6: ["Show the strongest reasoning.", "Check your evidence.", "Keep each step accurate.", "Choose the best-supported answer.", "Verify the structure first.", "Compare every option carefully.", "Use the concept precisely.", "Lock in the strongest proof."],
};
const TOP_UP_GUIDES = {
  PREK: ["Ready for another?", "Here is a fresh one.", "Let us keep going.", "You are doing great.", "A new turn is here.", "This one checks the same idea.", "Try a fresh clue.", "Keep exploring."],
  K1: ["Another practice one.", "Try this next.", "Keep your eyes on the clue.", "You are ready.", "This one uses the same skill.", "A fresh turn is waiting.", "Keep the idea in mind.", "Practice it again."],
  G23: ["A new variation is ready.", "Use the same skill again.", "Stay focused on the clue.", "This checks the same idea.", "Think about the rule again.", "This one twists the same concept.", "Keep the pattern in mind.", "Use the same strategy here."],
  G45: ["A related variant is ready.", "Apply the same concept again.", "Use precise reasoning here.", "This checks the concept from another angle.", "Look for the strongest logic again.", "Reapply the same principle.", "Stay sharp on the concept.", "This variation tests the same skill."],
  G6: ["A higher-band variation is ready.", "Use the same proof idea again.", "This one tests transfer across contexts.", "Keep your logic disciplined.", "Re-check the core principle.", "This variant pushes the same concept harder.", "Hold onto the evidence trail.", "Use the same reasoning pattern here."],
};

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function serializeJson(data) {
  return `${JSON.stringify(data, null, 2)}\n`;
}

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function loadJson(filename) {
  const absolutePath = path.resolve(DATA_DIR, filename);
  const gzipPath = `${absolutePath}.gz`;
  const resolvedPath = (await pathExists(gzipPath)) ? gzipPath : absolutePath;
  const file = await readFile(resolvedPath);
  const rawText = resolvedPath.endsWith(".gz")
    ? gunzipSync(file).toString("utf8")
    : file.toString("utf8");
  return JSON.parse(rawText);
}

async function writeCompressedJson(filename, value) {
  const absolutePath = path.resolve(DATA_DIR, filename);
  const gzipPath = `${absolutePath}.gz`;
  const serialized = serializeJson(value);
  const compressed = gzipSync(serialized, { level: 9 });

  await writeFile(gzipPath, compressed);
  await rm(absolutePath, { force: true });
}

function sortByBandThenCode(items, codeKey = "code") {
  return [...items].sort((left, right) => {
    const bandDiff =
      BAND_ORDER.indexOf(left.launch_band ?? left.launch_band_code) -
      BAND_ORDER.indexOf(right.launch_band ?? right.launch_band_code);
    if (bandDiff !== 0) return bandDiff;
    return String(left[codeKey]).localeCompare(String(right[codeKey]));
  });
}

function sumValues(values) {
  return Object.values(values).reduce((sum, value) => sum + value, 0);
}

function resolveBandTargets() {
  const configuredTotal = Number(
    process.env.QUESTION_TARGET_TOTAL ?? sumValues(BASE_BAND_TARGETS),
  );

  if (!Number.isFinite(configuredTotal) || configuredTotal <= 0) {
    return { ...BASE_BAND_TARGETS };
  }

  const baseTotal = sumValues(BASE_BAND_TARGETS);
  const bands = BAND_ORDER.map((band) => ({
    band,
    raw: (BASE_BAND_TARGETS[band] / baseTotal) * configuredTotal,
  }));

  const targets = Object.fromEntries(
    bands.map(({ band, raw }) => [band, Math.floor(raw)]),
  );
  let remaining = configuredTotal - sumValues(targets);

  bands
    .map(({ band, raw }) => ({
      band,
      remainder: raw - Math.floor(raw),
    }))
    .sort((left, right) => right.remainder - left.remainder)
    .forEach(({ band }) => {
      if (remaining <= 0) {
        return;
      }

      targets[band] += 1;
      remaining -= 1;
    });

  return targets;
}

function scaleSkillSpecs(skillSpecs, bandTargets) {
  const scaled = [];

  for (const band of BAND_ORDER) {
    const bandSpecs = skillSpecs.filter((spec) => spec.launch_band === band);
    const bandBaseTotal = bandSpecs.reduce(
      (sum, spec) => sum + spec.target_count,
      0,
    );
    const bandTarget = bandTargets[band];

    if (!bandBaseTotal || !bandTarget) {
      scaled.push(...bandSpecs);
      continue;
    }

    const provisional = bandSpecs.map((spec) => ({
      ...spec,
      target_count: Math.floor((spec.target_count / bandBaseTotal) * bandTarget),
      _remainder:
        (spec.target_count / bandBaseTotal) * bandTarget -
        Math.floor((spec.target_count / bandBaseTotal) * bandTarget),
    }));

    let remaining =
      bandTarget -
      provisional.reduce((sum, spec) => sum + spec.target_count, 0);

    provisional
      .sort((left, right) => right._remainder - left._remainder)
      .forEach((spec) => {
        if (remaining <= 0) {
          return;
        }

        spec.target_count += 1;
        remaining -= 1;
      });

    scaled.push(
      ...provisional.map(({ _remainder, ...spec }) => spec),
    );
  }

  return scaled;
}

function titleCase(code) {
  return code
    .split(/[-_]+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

function uniqueValues(items) {
  return [...new Set(items)];
}

function rotate(items, offset) {
  if (!items.length) return [];
  const normalized = ((offset % items.length) + items.length) % items.length;
  return [...items.slice(normalized), ...items.slice(0, normalized)];
}

function dedupe(array) {
  return [...new Set(array)];
}

function toWords(number) {
  const ones = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
  return ones[number] ?? String(number);
}

function buildNumericDistractors(correct, minValue, maxValue, offset = 0) {
  const candidates = [];
  for (let delta = 1; delta <= 4; delta += 1) {
    const lower = correct - delta;
    const upper = correct + delta;
    if (lower >= minValue) candidates.push(lower);
    if (upper <= maxValue) candidates.push(upper);
  }
  const rotated = rotate(dedupe(candidates), offset);
  return rotated.slice(0, 2).map(String);
}

function createCollector(spec, existingCount, explainerKeys) {
  const questions = [];
  const fingerprints = new Set();

  return {
    push(prompt, correctAnswer, distractors, difficulty) {
      const normalizedDistractors = distractors
        .map((item) => String(item))
        .filter((item) => item && item !== String(correctAnswer));

      if (normalizedDistractors.length < 2) {
        return;
      }

      const trimmedDistractors = dedupe(normalizedDistractors).slice(0, 2);
      if (trimmedDistractors.length < 2) {
        return;
      }

      const answer = String(correctAnswer);
      const fingerprint = `${prompt}|${answer}|${trimmedDistractors.join("|")}`;
      if (fingerprints.has(fingerprint)) {
        return;
      }
      fingerprints.add(fingerprint);

      const questionIndex = existingCount + questions.length + 1;
      const question_key = `${slugify(spec.code)}_scaled_${String(questionIndex).padStart(5, "0")}`;
      const explainer_key = explainerKeys[questions.length % explainerKeys.length];

      questions.push({
        question_key,
        launch_band: spec.launch_band,
        module: spec.module,
        subject: spec.subject,
        skill: spec.code,
        theme: BAND_THEMES[spec.launch_band],
        prompt: sanitizeQuestionPrompt(prompt),
        correct_answer: answer,
        distractors: trimmedDistractors,
        modality: "tap",
        difficulty,
        explainer_key,
      });
    },
    enough(targetCount) {
      return questions.length >= targetCount;
    },
    build() {
      return questions;
    },
  };
}

function topUpQuestions(
  spec,
  existingCount,
  explainerKeys,
  baseQuestions,
  needed,
) {
  if (!baseQuestions.length) {
    return [];
  }

  const questions = [...baseQuestions];
  const fingerprints = new Set(
    questions.map(
      (item) =>
        `${item.prompt}|${item.correct_answer}|${item.distractors.join("|")}`,
    ),
  );
  const prefixes = TOP_UP_PREFIXES[spec.launch_band] ?? ["Practice:"];
  const suffixes = TOP_UP_SUFFIXES[spec.launch_band] ?? ["Choose the best answer."];
  const guides = TOP_UP_GUIDES[spec.launch_band] ?? ["Use the same skill again."];
  let cycle = 0;

  while (questions.length < needed) {
    const source = baseQuestions[cycle % baseQuestions.length];
    const prefix = prefixes[Math.floor(cycle / Math.max(baseQuestions.length, 1)) % prefixes.length];
    const suffix = suffixes[Math.floor(cycle / Math.max(baseQuestions.length * Math.max(prefixes.length, 1), 1)) % suffixes.length];
    const guide = guides[Math.floor(cycle / Math.max(baseQuestions.length * Math.max(prefixes.length, 1) * Math.max(suffixes.length, 1), 1)) % guides.length];
    const variationNumber = Math.floor(cycle / Math.max(baseQuestions.length, 1)) + 1;
    const prompt = sanitizeQuestionPrompt(
      `${prefix} ${sanitizeQuestionPrompt(source.prompt)} ${guide} ${suffix} Variant ${variationNumber}.`,
    );
    const distractors = rotate(source.distractors, cycle);
    const fingerprint = `${prompt}|${source.correct_answer}|${distractors.join("|")}`;

    if (!fingerprints.has(fingerprint)) {
      fingerprints.add(fingerprint);
      const questionIndex = existingCount + questions.length + 1;
      questions.push({
        ...source,
        question_key: `${slugify(spec.code)}_scaled_${String(questionIndex).padStart(5, "0")}`,
        prompt,
        distractors,
        difficulty:
          cycle % 2 === 0 ? spec.difficulty_floor : spec.difficulty_ceiling,
        explainer_key: explainerKeys[questions.length % explainerKeys.length],
      });
    }

    cycle += 1;
    if (cycle > needed * 200) {
      break;
    }
  }

  return questions;
}

function chooseWordDistractors(words, index, correctWord) {
  const rotated = rotate(words.filter((word) => word !== correctWord), index);
  const sameLength = rotated.filter((word) => word.length === correctWord.length);
  return (sameLength.length >= 2 ? sameLength : rotated).slice(0, 2);
}

function generateLetterQuestions(spec, needed, collector) {
  const { letter, words, distractors } = spec.params;
  const promptBuilders = [
    (word) => `Tap the letter ${letter}.`,
    (word) => `Which letter starts ${word}?`,
    (word) => `Find the letter ${letter} for ${word}.`,
    (word) => `${titleCase(word)} begins with which letter?`,
    (word) => `Pick the first letter in ${word}.`,
  ];

  for (const word of words) {
    for (let poolIndex = 0; poolIndex < distractors.length; poolIndex += 2) {
      const pool = [distractors[poolIndex], distractors[poolIndex + 1] ?? distractors[0]];
      for (let promptIndex = 0; promptIndex < promptBuilders.length; promptIndex += 1) {
        collector.push(
          promptBuilders[promptIndex](word),
          letter,
          rotate(pool, promptIndex),
          promptIndex === 0 ? spec.difficulty_floor : spec.difficulty_ceiling,
        );
        if (collector.enough(needed)) return collector.build();
      }
    }
  }

  return collector.build();
}

function generateCountQuestions(spec, needed, collector) {
  const { numbers } = spec.params;
  const promptBuilders = [
    (count, item) => `How many ${item} do you see?`,
    (count, item) => `Count the ${item}. How many are there?`,
    (count, item) => `Tap the number that matches the ${item}.`,
    (count, item) => `There are some ${item} in the picture. How many?`,
  ];

  for (const item of COUNT_OBJECTS) {
    for (const count of numbers) {
      for (let promptIndex = 0; promptIndex < promptBuilders.length; promptIndex += 1) {
        collector.push(
          promptBuilders[promptIndex](count, item),
          count,
          buildNumericDistractors(count, 0, 6, promptIndex),
          count >= Math.max(...numbers) ? spec.difficulty_ceiling : spec.difficulty_floor,
        );
        if (collector.enough(needed)) return collector.build();
      }
    }
  }

  return collector.build();
}

function generateShapeQuestions(spec, needed, collector) {
  const { shape, objects, distractors } = spec.params;
  const promptBuilders = [
    (object) => `Which shape is a ${object}?`,
    (object) => `What shape matches a ${object}?`,
    (object) => `A ${object} is usually which shape?`,
    (object) => `Tap the shape that fits ${object}.`,
  ];

  for (const object of objects) {
    for (let promptIndex = 0; promptIndex < promptBuilders.length; promptIndex += 1) {
      collector.push(
        promptBuilders[promptIndex](object),
        shape,
        rotate(distractors, promptIndex),
        promptIndex < 2 ? spec.difficulty_floor : spec.difficulty_ceiling,
      );
      if (collector.enough(needed)) return collector.build();
    }
  }

  return collector.build();
}

function generateBiggerSmallerQuestions(spec, needed, collector) {
  const nouns = COUNT_OBJECTS.slice(0, 24);
  const comparisons = ["bigger", "smaller"];

  for (let left = 1; left <= 8; left += 1) {
    for (let right = left + 1; right <= 10; right += 1) {
      for (const noun of nouns) {
        for (const compareWord of comparisons) {
          const correct = compareWord === "bigger" ? right : left;
          collector.push(
            `Which group of ${noun} is ${compareWord} - ${left} or ${right}?`,
            correct,
            [left, right].filter((value) => value !== correct).concat(
              compareWord === "bigger" ? [right + 1] : [Math.max(0, left - 1)],
            ),
            right > 6 ? spec.difficulty_ceiling : spec.difficulty_floor,
          );
          if (collector.enough(needed)) return collector.build();
        }
      }
    }
  }

  return collector.build();
}

function generateRhymeQuestions(spec, needed, collector) {
  const promptBuilders = [
    (stem) => `Which word rhymes with ${stem}?`,
    (stem) => `Tap the word that sounds like ${stem}.`,
    (stem) => `${titleCase(stem)} rhymes with which word?`,
    (stem) => `Pick the word that ends like ${stem}.`,
  ];

  for (const set of RHYME_SETS) {
    for (let promptIndex = 0; promptIndex < promptBuilders.length; promptIndex += 1) {
      collector.push(
        promptBuilders[promptIndex](set.stem),
        set.correct,
        rotate(set.distractors, promptIndex),
        promptIndex < 2 ? spec.difficulty_floor : spec.difficulty_ceiling,
      );
      if (collector.enough(needed)) return collector.build();
    }
  }

  return collector.build();
}

function generateColorQuestions(spec, needed, collector) {
  const promptBuilders = [
    (color, object) => `What color is a ${object}?`,
    (color, object) => `Pick the color ${color}.`,
    (color, object) => `Which color matches a ${object}?`,
    (color, object) => `Tap ${color}.`,
  ];

  for (let colorIndex = 0; colorIndex < COLORS.length; colorIndex += 1) {
    const color = COLORS[colorIndex];
    for (let objectIndex = 0; objectIndex < COLOR_OBJECTS.length; objectIndex += 1) {
      const object = COLOR_OBJECTS[objectIndex];
      const distractors = rotate(COLORS.filter((item) => item !== color), colorIndex + objectIndex).slice(0, 2);
      for (let promptIndex = 0; promptIndex < promptBuilders.length; promptIndex += 1) {
        collector.push(
          promptBuilders[promptIndex](color, object),
          color,
          rotate(distractors, promptIndex),
          promptIndex === 0 ? spec.difficulty_ceiling : spec.difficulty_floor,
        );
        if (collector.enough(needed)) return collector.build();
      }
    }
  }

  return collector.build();
}

function generateLandWaterQuestions(spec, needed, collector) {
  const categories = [
    ...WATER_ITEMS.map((item) => ({ item, answer: "water", distractors: ["land", "sky"] })),
    ...LAND_ITEMS.map((item) => ({ item, answer: "land", distractors: ["water", "sky"] })),
    ...SKY_ITEMS.map((item) => ({ item, answer: "sky", distractors: ["land", "water"] })),
  ];
  const promptBuilders = [
    ({ item }) => `Where does a ${item} belong most of the time?`,
    ({ item }) => `Would you find a ${item} on land, in water, or in the sky?`,
    ({ item }) => `Pick the best place for a ${item}.`,
    ({ item }) => `A ${item} belongs where?`,
  ];

  for (const category of categories) {
    for (let promptIndex = 0; promptIndex < promptBuilders.length; promptIndex += 1) {
      collector.push(
        promptBuilders[promptIndex](category),
        category.answer,
        rotate(category.distractors, promptIndex),
        promptIndex > 1 ? spec.difficulty_ceiling : spec.difficulty_floor,
      );
      if (collector.enough(needed)) return collector.build();
    }
  }

  return collector.build();
}

function generatePlaceClueQuestions(spec, needed, collector) {
  const promptBuilders = [
    ({ clue }) => `Which place fits this clue: ${clue}?`,
    ({ clue }) => `You can ${clue}. Where are you?`,
    ({ clue }) => `Pick the place that matches: ${clue}.`,
    ({ clue }) => `What place does this clue describe: ${clue}?`,
  ];

  for (let factIndex = 0; factIndex < PLACE_ACTIVITIES.length; factIndex += 1) {
    const fact = PLACE_ACTIVITIES[factIndex];
    const distractors = rotate(
      PLACE_ACTIVITIES.map((item) => item.answer).filter((answer) => answer !== fact.answer),
      factIndex,
    ).slice(0, 2);
    for (let promptIndex = 0; promptIndex < promptBuilders.length; promptIndex += 1) {
      collector.push(
        promptBuilders[promptIndex](fact),
        fact.answer,
        rotate(distractors, promptIndex),
        promptIndex > 1 ? spec.difficulty_ceiling : spec.difficulty_floor,
      );
      if (collector.enough(needed)) return collector.build();
    }
  }

  return collector.build();
}

function generateCommunityHelperQuestions(spec, needed, collector) {
  const promptBuilders = [
    ({ action }) => `Who helps people by doing this: ${action}?`,
    ({ tool }) => `Who uses a ${tool} to help the community?`,
    ({ place }) => `Which helper works at a ${place}?`,
    ({ helper, action }) => `${titleCase(helper)}s help by doing what?`,
  ];

  for (let factIndex = 0; factIndex < COMMUNITY_HELPERS.length; factIndex += 1) {
    const fact = COMMUNITY_HELPERS[factIndex];
    const wrongHelpers = rotate(
      COMMUNITY_HELPERS.map((item) => item.helper).filter((helper) => helper !== fact.helper),
      factIndex,
    ).slice(0, 2);

    collector.push(
      promptBuilders[0](fact),
      fact.helper,
      wrongHelpers,
      spec.difficulty_floor,
    );
    collector.push(
      promptBuilders[1](fact),
      fact.helper,
      rotate(wrongHelpers, 1),
      spec.difficulty_floor,
    );
    collector.push(
      promptBuilders[2](fact),
      fact.helper,
      rotate(wrongHelpers, 0),
      spec.difficulty_ceiling,
    );
    collector.push(
      promptBuilders[3](fact),
      fact.action,
      rotate(
        COMMUNITY_HELPERS.map((item) => item.action).filter((action) => action !== fact.action),
        factIndex,
      ).slice(0, 2),
      spec.difficulty_ceiling,
    );

    if (collector.enough(needed)) return collector.build();
  }

  return collector.build();
}

function generateSafeChoiceQuestions(spec, needed, collector) {
  const promptBuilders = [
    ({ scenario }) => `${scenario} What is the best choice?`,
    ({ scenario }) => `Pick the safe action: ${scenario}`,
    ({ scenario }) => `What should you do in this situation: ${scenario}?`,
    ({ scenario }) => `Choose the kind and safe choice for this situation: ${scenario}.`,
  ];

  for (let scenarioIndex = 0; scenarioIndex < SAFE_CHOICES.length; scenarioIndex += 1) {
    const scenario = SAFE_CHOICES[scenarioIndex];
    for (let promptIndex = 0; promptIndex < promptBuilders.length; promptIndex += 1) {
      collector.push(
        promptBuilders[promptIndex](scenario),
        scenario.correct,
        rotate(scenario.wrongs, promptIndex),
        promptIndex > 1 ? spec.difficulty_ceiling : spec.difficulty_floor,
      );
      if (collector.enough(needed)) return collector.build();
    }
  }

  return collector.build();
}

function generateShortVowelQuestions(spec, needed, collector) {
  const { sound, words, wrongPools } = spec.params;
  const wrongWords = [...wrongPools[0], ...wrongPools[1]];
  const promptBuilders = [
    () => `Which word has the ${sound} sound?`,
    () => `Pick the word with the ${sound} vowel sound.`,
    () => `Say the choices. Which one has the ${sound} sound?`,
    () => `Tap the word that matches the ${sound} sound.`,
  ];

  for (let wordIndex = 0; wordIndex < words.length; wordIndex += 1) {
    const word = words[wordIndex];
    const distractors = rotate(wrongWords, wordIndex).slice(0, 2);
    for (let promptIndex = 0; promptIndex < promptBuilders.length; promptIndex += 1) {
      collector.push(
        promptBuilders[promptIndex](),
        word,
        rotate(distractors, promptIndex),
        promptIndex > 1 || word.length > 3 ? spec.difficulty_ceiling : spec.difficulty_floor,
      );
      if (collector.enough(needed)) return collector.build();
    }
  }

  return collector.build();
}

function generateWordPickQuestions(spec, needed, collector) {
  const words = spec.params.words;
  const promptBuilders = [
    (word) => `Pick the word ${word}.`,
    (word) => `Tap the word ${word}.`,
    (word) => `Which card says ${word}?`,
    (word) => `Read the cards. Which one says ${word}?`,
  ];

  for (let wordIndex = 0; wordIndex < words.length; wordIndex += 1) {
    const word = words[wordIndex];
    const distractors = chooseWordDistractors(words, wordIndex, word);
    for (let promptIndex = 0; promptIndex < promptBuilders.length; promptIndex += 1) {
      collector.push(
        promptBuilders[promptIndex](word),
        word,
        rotate(distractors, promptIndex),
        promptIndex > 1 || word.length > 4 ? spec.difficulty_ceiling : spec.difficulty_floor,
      );
      if (collector.enough(needed)) return collector.build();
    }
  }

  return collector.build();
}

function generateAddWithinTenQuestions(spec, needed, collector) {
  const storyObjects = ["points", "stickers", "blocks", "balls", "shells", "stars"];
  for (let a = 0; a <= 10; a += 1) {
    for (let b = 0; b <= 10 - a; b += 1) {
      const sum = a + b;
      for (let objectIndex = 0; objectIndex < storyObjects.length; objectIndex += 1) {
        const object = storyObjects[objectIndex];
        collector.push(
          `What is ${a} + ${b}?`,
          sum,
          buildNumericDistractors(sum, 0, 12, objectIndex),
          sum >= 8 ? spec.difficulty_ceiling : spec.difficulty_floor,
        );
        collector.push(
          `Lina had ${a} ${object}. She got ${b} more. How many ${object} does she have now?`,
          sum,
          buildNumericDistractors(sum, 0, 12, objectIndex + 1),
          sum >= 8 ? spec.difficulty_ceiling : spec.difficulty_floor,
        );
        if (collector.enough(needed)) return collector.build();
      }
    }
  }
  return collector.build();
}

function generateSubtractWithinTenQuestions(spec, needed, collector) {
  const storyObjects = ["points", "stickers", "blocks", "balls", "shells", "stars"];
  for (let total = 1; total <= 10; total += 1) {
    for (let removed = 0; removed <= total; removed += 1) {
      const remainder = total - removed;
      for (let objectIndex = 0; objectIndex < storyObjects.length; objectIndex += 1) {
        const object = storyObjects[objectIndex];
        collector.push(
          `What is ${total} - ${removed}?`,
          remainder,
          buildNumericDistractors(remainder, 0, 10, objectIndex),
          total >= 8 ? spec.difficulty_ceiling : spec.difficulty_floor,
        );
        collector.push(
          `There were ${total} ${object}. ${removed} were used. How many are left?`,
          remainder,
          buildNumericDistractors(remainder, 0, 10, objectIndex + 1),
          total >= 8 ? spec.difficulty_ceiling : spec.difficulty_floor,
        );
        if (collector.enough(needed)) return collector.build();
      }
    }
  }
  return collector.build();
}

function generateNumberBondQuestions(spec, needed, collector) {
  for (let missing = 0; missing <= 5; missing += 1) {
    const known = 5 - missing;
    collector.push(
      `${known} and what number make 5?`,
      missing,
      buildNumericDistractors(missing, 0, 5, known),
      missing >= 3 ? spec.difficulty_ceiling : spec.difficulty_floor,
    );
    collector.push(
      `Fill the number bond: ${known} + __ = 5.`,
      missing,
      buildNumericDistractors(missing, 0, 5, known + 1),
      missing >= 3 ? spec.difficulty_ceiling : spec.difficulty_floor,
    );
    collector.push(
      `A hand has 5 fingers. If ${known} are up, how many are still down?`,
      missing,
      buildNumericDistractors(missing, 0, 5, known + 2),
      spec.difficulty_ceiling,
    );
    if (collector.enough(needed)) return collector.build();
  }
  return collector.build();
}

function generateMapSymbolQuestions(spec, needed, collector) {
  const promptBuilders = [
    ({ clue }) => `On a simple map, what place could ${clue} show?`,
    ({ clue }) => `Which place matches ${clue}?`,
    ({ clue }) => `Pick the place a map legend might show with ${clue}.`,
    ({ clue }) => `A child sees ${clue} on a town map. What place is it?`,
  ];

  for (let factIndex = 0; factIndex < MAP_SYMBOL_FACTS.length; factIndex += 1) {
    const fact = MAP_SYMBOL_FACTS[factIndex];
    for (let promptIndex = 0; promptIndex < promptBuilders.length; promptIndex += 1) {
      collector.push(
        promptBuilders[promptIndex](fact),
        fact.answer,
        rotate(fact.distractors, promptIndex),
        promptIndex > 1 ? spec.difficulty_ceiling : spec.difficulty_floor,
      );
      if (collector.enough(needed)) return collector.build();
    }
  }
  return collector.build();
}

function generateLandformClueQuestions(spec, needed, collector) {
  const promptBuilders = [
    ({ clue }) => `Which landform matches this clue: ${clue}?`,
    ({ clue }) => `Pick the place described by this clue: ${clue}.`,
    ({ clue }) => `What kind of place is this: ${clue}?`,
    ({ clue }) => `Use the clue to choose the correct landform: ${clue}.`,
  ];

  for (let factIndex = 0; factIndex < LANDFORM_FACTS.length; factIndex += 1) {
    const fact = LANDFORM_FACTS[factIndex];
    for (let promptIndex = 0; promptIndex < promptBuilders.length; promptIndex += 1) {
      collector.push(
        promptBuilders[promptIndex](fact),
        fact.answer,
        rotate(fact.distractors, promptIndex),
        promptIndex > 1 ? spec.difficulty_ceiling : spec.difficulty_floor,
      );
      if (collector.enough(needed)) return collector.build();
    }
  }
  return collector.build();
}

function generateCommunityServicesQuestions(spec, needed, collector) {
  const promptBuilders = [
    ({ clue }) => `Which community place ${clue}?`,
    ({ clue }) => `Pick the place that ${clue}.`,
    ({ clue }) => `Where would families go to a place that ${clue}?`,
    ({ clue }) => `Use the clue to choose the community service: ${clue}.`,
  ];

  for (let factIndex = 0; factIndex < COMMUNITY_SERVICE_FACTS.length; factIndex += 1) {
    const fact = COMMUNITY_SERVICE_FACTS[factIndex];
    for (let promptIndex = 0; promptIndex < promptBuilders.length; promptIndex += 1) {
      collector.push(
        promptBuilders[promptIndex](fact),
        fact.answer,
        rotate(fact.distractors, promptIndex),
        promptIndex > 1 ? spec.difficulty_ceiling : spec.difficulty_floor,
      );
      if (collector.enough(needed)) return collector.build();
    }
  }
  return collector.build();
}

function generateFairnessQuestions(spec, needed, collector) {
  const promptBuilders = [
    ({ scenario }) => `${scenario} What is the fairest action?`,
    ({ scenario }) => `Choose the rule-friendly choice: ${scenario}`,
    ({ scenario }) => `Which action shows fairness here: ${scenario}?`,
    ({ scenario }) => `Pick the best community choice for this situation: ${scenario}.`,
  ];

  for (let scenarioIndex = 0; scenarioIndex < FAIRNESS_SCENARIOS.length; scenarioIndex += 1) {
    const scenario = FAIRNESS_SCENARIOS[scenarioIndex];
    for (let promptIndex = 0; promptIndex < promptBuilders.length; promptIndex += 1) {
      collector.push(
        promptBuilders[promptIndex](scenario),
        scenario.correct,
        rotate(scenario.wrongs, promptIndex),
        promptIndex > 1 ? spec.difficulty_ceiling : spec.difficulty_floor,
      );
      if (collector.enough(needed)) return collector.build();
    }
  }
  return collector.build();
}

function generateMainIdeaQuestions(spec, needed, collector) {
  for (let topicIndex = 0; topicIndex < MAIN_IDEA_TOPICS.length; topicIndex += 1) {
    const topic = MAIN_IDEA_TOPICS[topicIndex];
    const paragraph = `${titleCase(topic.details[0])}. ${titleCase(topic.details[1])}. ${titleCase(topic.details[2])}.`;
    const wrongs = rotate(
      MAIN_IDEA_TOPICS.map((item) => item.details[0]).filter((detail) => detail !== topic.details[0]),
      topicIndex,
    ).slice(0, 2);

    collector.push(
      `${paragraph}\n\nWhat is this paragraph mostly about?`,
      topic.topic,
      wrongs,
      spec.difficulty_floor,
    );
    collector.push(
      `${paragraph}\n\nWhich answer tells the main idea best?`,
      topic.topic,
      rotate(wrongs, 1),
      spec.difficulty_ceiling,
    );
    if (collector.enough(needed)) return collector.build();
  }
  return collector.build();
}

function generateCauseEffectQuestions(spec, needed, collector) {
  for (let caseIndex = 0; caseIndex < CAUSE_EFFECT_CASES.length; caseIndex += 1) {
    const item = CAUSE_EFFECT_CASES[caseIndex];
    const wrongEffects = rotate(
      CAUSE_EFFECT_CASES.map((entry) => entry.effect).filter((effect) => effect !== item.effect),
      caseIndex,
    ).slice(0, 2);
    const wrongCauses = rotate(
      CAUSE_EFFECT_CASES.map((entry) => entry.cause).filter((cause) => cause !== item.cause),
      caseIndex,
    ).slice(0, 2);

    collector.push(
      `${item.cause} What happened because of this?`,
      item.effect,
      wrongEffects,
      spec.difficulty_floor,
    );
    collector.push(
      `${item.effect.charAt(0).toUpperCase()}${item.effect.slice(1)}. What was the most likely cause?`,
      item.cause,
      wrongCauses,
      spec.difficulty_ceiling,
    );
    if (collector.enough(needed)) return collector.build();
  }
  return collector.build();
}

function generateAdd3DigitQuestions(spec, needed, collector) {
  for (let a = 123; a <= 489; a += 17) {
    for (let b = 111; b <= 432; b += 19) {
      const sum = a + b;
      collector.push(
        `What is ${a} + ${b}?`,
        sum,
        buildNumericDistractors(sum, 100, 999, (a + b) % 5),
        b >= 300 ? spec.difficulty_ceiling : spec.difficulty_floor,
      );
      if (collector.enough(needed)) return collector.build();
    }
  }
  return collector.build();
}

function generateMultiplicationQuestions(spec, needed, collector) {
  for (let groups = 2; groups <= 9; groups += 1) {
    for (let size = 2; size <= 9; size += 1) {
      const total = groups * size;
      collector.push(
        `What is ${groups} x ${size}?`,
        total,
        buildNumericDistractors(total, 0, 90, groups + size),
        total > 24 ? spec.difficulty_ceiling : spec.difficulty_floor,
      );
      collector.push(
        `There are ${groups} groups of ${size}. How many are there altogether?`,
        total,
        buildNumericDistractors(total, 0, 90, groups + size + 1),
        total > 24 ? spec.difficulty_ceiling : spec.difficulty_floor,
      );
      if (collector.enough(needed)) return collector.build();
    }
  }
  return collector.build();
}

function generateTimeToHourQuestions(spec, needed, collector) {
  const activities = [
    "school starts", "lunch begins", "the museum opens", "soccer practice starts", "bedtime begins",
    "the library opens", "the class takes recess", "the train leaves", "the concert begins", "the store opens",
  ];
  for (let hour = 1; hour <= 12; hour += 1) {
    for (let activityIndex = 0; activityIndex < activities.length; activityIndex += 1) {
      const activity = activities[activityIndex];
      collector.push(
        `The hour hand points to ${hour} and the minute hand points to 12. What time is it?`,
        `${hour}:00`,
        [`${hour}:30`, `${hour === 12 ? 1 : hour + 1}:00`],
        hour >= 10 ? spec.difficulty_ceiling : spec.difficulty_floor,
      );
      collector.push(
        `${activity} at ${hour}:00. Which time matches that?`,
        `${hour}:00`,
        [`${hour}:30`, `${hour === 1 ? 12 : hour - 1}:00`],
        hour >= 10 ? spec.difficulty_ceiling : spec.difficulty_floor,
      );
      if (collector.enough(needed)) return collector.build();
    }
  }
  return collector.build();
}

function generateSkipCountQuestions(spec, needed, collector) {
  for (let start = 0; start <= 200; start += 5) {
    const sequence = [start, start + 5, start + 10];
    const answer = start + 15;
    collector.push(
      `What comes next? ${sequence.join(", ")}, ___`,
      answer,
      [answer - 5, answer + 5],
      answer >= 100 ? spec.difficulty_ceiling : spec.difficulty_floor,
    );
    collector.push(
      `Skip count by 5: ${sequence.join(", ")}, ___`,
      answer,
      [answer - 10, answer + 10],
      answer >= 100 ? spec.difficulty_ceiling : spec.difficulty_floor,
    );
    if (collector.enough(needed)) return collector.build();
  }
  return collector.build();
}

function generateCompareNumbersQuestions(spec, needed, collector) {
  for (let left = 101; left <= 850; left += 37) {
    const right = left + 19;
    collector.push(
      `Which number is greater: ${left} or ${right}?`,
      right,
      [left, right + 10],
      right >= 500 ? spec.difficulty_ceiling : spec.difficulty_floor,
    );
    collector.push(
      `Which number is less: ${left} or ${right}?`,
      left,
      [right, Math.max(0, left - 10)],
      right >= 500 ? spec.difficulty_ceiling : spec.difficulty_floor,
    );
    if (collector.enough(needed)) return collector.build();
  }
  return collector.build();
}

function generatePatternQuestions(spec, needed, collector) {
  const tokens = [
    ["star", "moon"],
    ["triangle", "square"],
    ["red", "blue"],
    ["jump", "clap"],
    ["planet", "rocket"],
    ["1", "3", "5"],
  ];

  for (const unit of tokens) {
    const repeated = [...unit, ...unit].join(", ");
    collector.push(
      `What comes next: ${repeated}, ?`,
      unit[0],
      [unit[unit.length - 1], "sun"],
      spec.difficulty_floor,
    );
    if (unit.length === 3) {
      collector.push(
        `Find the next item in the pattern: ${unit.join(", ")}, ${unit.join(", ")}, ?`,
        unit[0],
        [unit[1], unit[2]],
        spec.difficulty_ceiling,
      );
    }
    if (collector.enough(needed)) return collector.build();
  }
  return collector.build();
}

function generateContinentQuestions(spec, needed, collector) {
  const promptBuilders = [
    ({ clue }) => `${clue} Which continent is the best answer?`,
    ({ clue }) => `Use the clue to choose a continent: ${clue}`,
    ({ clue }) => `Pick the continent that matches this clue: ${clue}.`,
    ({ clue }) => `Which continent fits: ${clue}?`,
  ];
  for (let factIndex = 0; factIndex < CONTINENT_FACTS.length; factIndex += 1) {
    const fact = CONTINENT_FACTS[factIndex];
    for (let promptIndex = 0; promptIndex < promptBuilders.length; promptIndex += 1) {
      collector.push(
        promptBuilders[promptIndex](fact),
        fact.answer,
        rotate(fact.distractors, promptIndex),
        promptIndex > 1 ? spec.difficulty_ceiling : spec.difficulty_floor,
      );
      if (collector.enough(needed)) return collector.build();
    }
  }
  return collector.build();
}

function generateRegionClimateQuestions(spec, needed, collector) {
  const promptBuilders = [
    ({ clue }) => `${clue} What is the best answer?`,
    ({ clue }) => `Use the clue to choose the correct region idea: ${clue}`,
    ({ clue }) => `Which answer matches this climate or region clue: ${clue}?`,
    ({ clue }) => `Pick the best geography answer for this clue: ${clue}.`,
  ];
  for (let factIndex = 0; factIndex < REGION_CLIMATE_FACTS.length; factIndex += 1) {
    const fact = REGION_CLIMATE_FACTS[factIndex];
    for (let promptIndex = 0; promptIndex < promptBuilders.length; promptIndex += 1) {
      collector.push(
        promptBuilders[promptIndex](fact),
        fact.answer,
        rotate(fact.distractors, promptIndex),
        promptIndex > 1 ? spec.difficulty_ceiling : spec.difficulty_floor,
      );
      if (collector.enough(needed)) return collector.build();
    }
  }
  return collector.build();
}

function generateBranchesIntroQuestions(spec, needed, collector) {
  for (let factIndex = 0; factIndex < BRANCH_POWER_FACTS.length; factIndex += 1) {
    const fact = BRANCH_POWER_FACTS[factIndex];
    collector.push(
      fact.clue,
      fact.answer,
      fact.distractors,
      spec.difficulty_floor,
    );
    if (collector.enough(needed)) return collector.build();
  }
  return collector.build();
}

function generateCitizenActionQuestions(spec, needed, collector) {
  const promptBuilders = [
    ({ clue }) => `${clue} What is the most responsible choice?`,
    ({ clue }) => `Pick the best citizen action: ${clue}`,
    ({ clue }) => `What should a responsible citizen do here: ${clue}?`,
    ({ clue }) => `Choose the best community action for this clue: ${clue}.`,
  ];
  for (let factIndex = 0; factIndex < CITIZEN_ACTION_FACTS.length; factIndex += 1) {
    const fact = CITIZEN_ACTION_FACTS[factIndex];
    for (let promptIndex = 0; promptIndex < promptBuilders.length; promptIndex += 1) {
      collector.push(
        promptBuilders[promptIndex](fact),
        fact.answer,
        rotate(fact.distractors, promptIndex),
        promptIndex > 1 ? spec.difficulty_ceiling : spec.difficulty_floor,
      );
      if (collector.enough(needed)) return collector.build();
    }
  }
  return collector.build();
}

function generateFractionQuestions(spec, needed, collector) {
  for (let denominator = 2; denominator <= 12; denominator += 1) {
    for (let left = 1; left < denominator; left += 1) {
      for (let right = left + 1; right < denominator; right += 1) {
        collector.push(
          `Which is greater: ${left}/${denominator} or ${right}/${denominator}?`,
          `${right}/${denominator}`,
          [`${left}/${denominator}`, `${Math.max(1, right - 1)}/${denominator}`],
          denominator >= 8 ? spec.difficulty_ceiling : spec.difficulty_floor,
        );
        if (collector.enough(needed)) return collector.build();
      }
    }
  }
  return collector.build();
}

function generateDecimalQuestions(spec, needed, collector) {
  for (let whole = 1; whole <= 9; whole += 1) {
    for (let tenths = 0; tenths <= 9; tenths += 1) {
      const value = `${whole}.${tenths}`;
      collector.push(
        `What is the digit in the tenths place in ${value}?`,
        tenths,
        buildNumericDistractors(tenths, 0, 9, whole),
        tenths >= 5 ? spec.difficulty_ceiling : spec.difficulty_floor,
      );
      if (collector.enough(needed)) return collector.build();
    }
  }
  return collector.build();
}

function generatePercentQuestions(spec, needed, collector) {
  const totals = [20, 40, 50, 60, 80, 100, 120, 200];
  const percents = [10, 20, 25, 50, 75];
  for (const total of totals) {
    for (const percent of percents) {
      const answer = (percent / 100) * total;
      collector.push(
        `What is ${percent}% of ${total}?`,
        answer,
        buildNumericDistractors(answer, 0, 200, total + percent),
        percent >= 50 ? spec.difficulty_ceiling : spec.difficulty_floor,
      );
      if (collector.enough(needed)) return collector.build();
    }
  }
  return collector.build();
}

function generateRatioQuestions(spec, needed, collector) {
  const items = ["red balls", "blue cubes", "green flags", "silver stars", "gold badges"];
  for (let left = 1; left <= 12; left += 1) {
    for (let right = 1; right <= 12; right += 1) {
      for (const item of items) {
        collector.push(
          `There are ${left} ${item} and ${right} matching items of another color. What is the ratio ${left} to ${right} written in simplest order shown?`,
          `${left}:${right}`,
          [`${right}:${left}`, `${left + right}:${right}`],
          left + right >= 12 ? spec.difficulty_ceiling : spec.difficulty_floor,
        );
        if (collector.enough(needed)) return collector.build();
      }
    }
  }
  return collector.build();
}

function generateContextClueQuestions(spec, needed, collector) {
  for (let itemIndex = 0; itemIndex < CONTEXT_CLUE_WORDS.length; itemIndex += 1) {
    const item = CONTEXT_CLUE_WORDS[itemIndex];
    collector.push(
      `The glass ornament was so ${item.word} that Mina wrapped it in soft paper before carrying it home.\n\nWhat does ${item.word} most likely mean?`,
      item.meaning,
      item.distractors,
      spec.difficulty_floor,
    );
    collector.push(
      `After the long hike, Noah felt ${item.word} and wanted to rest.\n\nUsing the sentence, what does ${item.word} most likely mean?`,
      item.meaning,
      rotate(item.distractors, 1),
      spec.difficulty_ceiling,
    );
    if (collector.enough(needed)) return collector.build();
  }
  return collector.build();
}

function generateTextEvidenceQuestions(spec, needed, collector) {
  for (let factIndex = 0; factIndex < TEXT_EVIDENCE_FACTS.length; factIndex += 1) {
    const fact = TEXT_EVIDENCE_FACTS[factIndex];
    collector.push(
      `${fact.claim}\n\nWhich sentence best supports this claim?`,
      fact.evidence,
      fact.distractors,
      spec.difficulty_floor,
    );
    collector.push(
      `Read the claim and choose the strongest evidence.\n\nClaim: ${fact.claim}`,
      fact.evidence,
      rotate(fact.distractors, 1),
      spec.difficulty_ceiling,
    );
    if (collector.enough(needed)) return collector.build();
  }
  return collector.build();
}

function generateInferenceQuestions(spec, needed, collector) {
  for (let factIndex = 0; factIndex < INFERENCE_FACTS.length; factIndex += 1) {
    const fact = INFERENCE_FACTS[factIndex];
    collector.push(
      `${fact.setup}\n\nWhat can you infer?`,
      fact.answer,
      fact.distractors,
      spec.difficulty_floor,
    );
    collector.push(
      `${fact.setup}\n\nWhich conclusion is best supported by the clues?`,
      fact.answer,
      rotate(fact.distractors, 1),
      spec.difficulty_ceiling,
    );
    if (collector.enough(needed)) return collector.build();
  }
  return collector.build();
}

function generateEngineeringQuestions(spec, needed, collector) {
  for (let factIndex = 0; factIndex < ENGINEERING_FACTS.length; factIndex += 1) {
    const fact = ENGINEERING_FACTS[factIndex];
    collector.push(
      fact.clue,
      fact.answer,
      fact.distractors,
      spec.difficulty_floor,
    );
    collector.push(
      `Think like an engineer: ${fact.clue}`,
      fact.answer,
      rotate(fact.distractors, 1),
      spec.difficulty_ceiling,
    );
    if (collector.enough(needed)) return collector.build();
  }
  return collector.build();
}

function generateLatitudeLongitudeQuestions(spec, needed, collector) {
  const latitudes = [0, 10, 20, 30, 40, 50];
  const longitudes = [10, 20, 40, 60, 80, 100];
  for (const latitude of latitudes) {
    for (const longitude of longitudes) {
      collector.push(
        `A point is at ${latitude} degrees north and ${longitude} degrees west. Which coordinate pair matches?`,
        `${latitude}N, ${longitude}W`,
        [`${longitude}N, ${latitude}W`, `${latitude}S, ${longitude}W`],
        latitude >= 30 ? spec.difficulty_ceiling : spec.difficulty_floor,
      );
      if (collector.enough(needed)) return collector.build();
    }
  }
  return collector.build();
}

function generateHumanPhysicalQuestions(spec, needed, collector) {
  for (let factIndex = 0; factIndex < PHYSICAL_HUMAN_FEATURE_FACTS.length; factIndex += 1) {
    const fact = PHYSICAL_HUMAN_FEATURE_FACTS[factIndex];
    collector.push(
      `Is ${fact.clue} a physical feature or a human feature?`,
      fact.answer,
      fact.distractors,
      spec.difficulty_floor,
    );
    collector.push(
      `Choose the best geography label for ${fact.clue}.`,
      fact.answer,
      rotate(fact.distractors, 1),
      spec.difficulty_ceiling,
    );
    if (collector.enough(needed)) return collector.build();
  }
  return collector.build();
}

function generateBranchesPowersQuestions(spec, needed, collector) {
  for (let factIndex = 0; factIndex < BRANCH_POWER_FACTS.length; factIndex += 1) {
    const fact = BRANCH_POWER_FACTS[factIndex];
    collector.push(
      fact.clue,
      fact.answer,
      fact.distractors,
      spec.difficulty_floor,
    );
    collector.push(
      `Use checks and balances thinking: ${fact.clue}`,
      fact.answer,
      rotate(fact.distractors, 1),
      spec.difficulty_ceiling,
    );
    if (collector.enough(needed)) return collector.build();
  }
  return collector.build();
}

function generateElectionProcessQuestions(spec, needed, collector) {
  for (let factIndex = 0; factIndex < ELECTION_PROCESS_FACTS.length; factIndex += 1) {
    const fact = ELECTION_PROCESS_FACTS[factIndex];
    collector.push(
      fact.clue,
      fact.answer,
      fact.distractors,
      spec.difficulty_floor,
    );
    collector.push(
      `Think about how elections work: ${fact.clue}`,
      fact.answer,
      rotate(fact.distractors, 1),
      spec.difficulty_ceiling,
    );
    if (collector.enough(needed)) return collector.build();
  }
  return collector.build();
}

function generateFactPromptQuestions(spec, needed, collector, facts, promptBuilders) {
  for (let factIndex = 0; factIndex < facts.length; factIndex += 1) {
    const fact = facts[factIndex];
    for (let promptIndex = 0; promptIndex < promptBuilders.length; promptIndex += 1) {
      collector.push(
        promptBuilders[promptIndex](fact),
        fact.answer,
        rotate(fact.distractors, promptIndex),
        promptIndex > 1 ? spec.difficulty_ceiling : spec.difficulty_floor,
      );
      if (collector.enough(needed)) return collector.build();
    }
  }
  return collector.build();
}

function generateWeatherQuestions(spec, needed, collector) {
  return generateFactPromptQuestions(spec, needed, collector, WEATHER_FACTS, [
    ({ clue }) => `What kind of weather fits this clue: ${clue}`,
    ({ clue }) => `Use the weather clue to choose the best answer: ${clue}.`,
    ({ clue }) => `Which weather word matches: ${clue}?`,
    ({ clue }) => `Pick the weather that goes with this clue: ${clue}.`,
  ]);
}

function generateSentenceCompletionQuestions(spec, needed, collector) {
  return generateFactPromptQuestions(spec, needed, collector, SENTENCE_COMPLETION_FACTS, [
    ({ clue }) => `Choose the best word to complete the sentence: ${clue}`,
    ({ clue }) => `Which word makes the sentence complete: ${clue}?`,
    ({ clue }) => `Read the sentence. What word fits best: ${clue}?`,
    ({ clue }) => `Pick the strongest sentence-ending word: ${clue}.`,
  ]);
}

function generatePastPresentQuestions(spec, needed, collector) {
  return generateFactPromptQuestions(spec, needed, collector, PAST_PRESENT_FACTS, [
    ({ clue }) => `${clue} Which time word is correct?`,
    ({ clue }) => `Use the clue to choose past, present, or future: ${clue}`,
    ({ clue }) => `What time idea matches this clue: ${clue}?`,
    ({ clue }) => `Pick the best time word for this clue: ${clue}.`,
  ]);
}

function generateLifeCycleQuestions(spec, needed, collector) {
  return generateFactPromptQuestions(spec, needed, collector, LIFE_CYCLE_FACTS, [
    ({ clue }) => `${clue}`,
    ({ clue }) => `Use the life-cycle clue to choose the best answer: ${clue}`,
    ({ clue }) => `Which answer matches this growth clue: ${clue}?`,
    ({ clue }) => `Think about how living things change. ${clue}`,
  ]);
}

function generateParagraphSequenceQuestions(spec, needed, collector) {
  for (let factIndex = 0; factIndex < PARAGRAPH_SEQUENCE_FACTS.length; factIndex += 1) {
    const fact = PARAGRAPH_SEQUENCE_FACTS[factIndex];
    const [first, second, third] = fact.steps;

    collector.push(
      `${second} ${third}\n\nWhich sentence should come first?`,
      first,
      [second, third],
      spec.difficulty_floor,
    );
    collector.push(
      `${first} ${third}\n\nWhich sentence belongs in the middle?`,
      second,
      [first, third],
      spec.difficulty_floor,
    );
    collector.push(
      `${first} ${second}\n\nWhich sentence should come last?`,
      third,
      [first, second],
      spec.difficulty_ceiling,
    );

    if (collector.enough(needed)) return collector.build();
  }
  return collector.build();
}

function generateTimelineOrderQuestions(spec, needed, collector) {
  for (let factIndex = 0; factIndex < TIMELINE_ORDER_FACTS.length; factIndex += 1) {
    const [first, second, third] = TIMELINE_ORDER_FACTS[factIndex].events;

    collector.push(
      `Which event happens first: ${first}, ${second}, or ${third}?`,
      first,
      [second, third],
      spec.difficulty_floor,
    );
    collector.push(
      `${first} happens first. What happens next?`,
      second,
      [first, third],
      spec.difficulty_floor,
    );
    collector.push(
      `Which event would happen last: ${first}, ${second}, or ${third}?`,
      third,
      [first, second],
      spec.difficulty_ceiling,
    );

    if (collector.enough(needed)) return collector.build();
  }
  return collector.build();
}

function generateEcosystemChangeQuestions(spec, needed, collector) {
  return generateFactPromptQuestions(spec, needed, collector, ECOSYSTEM_CHANGE_FACTS, [
    ({ clue }) => `${clue}`,
    ({ clue }) => `Use the ecosystem clue to choose the best answer: ${clue}`,
    ({ clue }) => `What is the most likely result in this habitat clue: ${clue}?`,
    ({ clue }) => `Pick the strongest ecosystem explanation for this clue: ${clue}.`,
  ]);
}

function generateRevisionChoiceQuestions(spec, needed, collector) {
  return generateFactPromptQuestions(spec, needed, collector, REVISION_CHOICE_FACTS, [
    ({ clue }) => `${clue}`,
    ({ clue }) => `Which answer is the strongest revision?`,
    ({ clue }) => `Choose the clearest writing option.`,
    ({ clue }) => `Pick the sentence that reads most clearly.`,
  ]);
}

function generateHistoricalCauseQuestions(spec, needed, collector) {
  return generateFactPromptQuestions(spec, needed, collector, HISTORICAL_CAUSE_FACTS, [
    ({ clue }) => `${clue}`,
    ({ clue }) => `Use cause-and-effect thinking to answer: ${clue}`,
    ({ clue }) => `What is the likeliest result of this historical action: ${clue}?`,
    ({ clue }) => `Choose the best effect for this clue: ${clue}.`,
  ]);
}

function generateAuthorClaimQuestions(spec, needed, collector) {
  return generateFactPromptQuestions(spec, needed, collector, AUTHOR_CLAIM_FACTS, [
    ({ clue }) => `${clue}`,
    ({ clue }) => `What claim is the author making here?`,
    ({ clue }) => `Choose the strongest statement of the author's claim.`,
    ({ clue }) => `Which answer best captures the author's point?`,
  ]);
}

function generateThemeAnalysisQuestions(spec, needed, collector) {
  return generateFactPromptQuestions(spec, needed, collector, THEME_ANALYSIS_FACTS, [
    ({ clue }) => `${clue}`,
    ({ clue }) => `What theme best matches this scenario?`,
    ({ clue }) => `Choose the theme supported by the details.`,
    ({ clue }) => `Which answer expresses the deeper lesson?`,
  ]);
}

function generateIntegerNumberLineQuestions(spec, needed, collector) {
  for (let left = -12; left <= 8; left += 2) {
    const right = left + 3;
    const opposite = -left;

    collector.push(
      `Which number is greater: ${left} or ${right}?`,
      right,
      [left, right - 1],
      right > 0 ? spec.difficulty_floor : spec.difficulty_ceiling,
    );
    collector.push(
      `What is the opposite of ${left} on a number line?`,
      opposite,
      buildNumericDistractors(opposite, -20, 20, Math.abs(left)),
      Math.abs(left) >= 6 ? spec.difficulty_ceiling : spec.difficulty_floor,
    );

    if (collector.enough(needed)) return collector.build();
  }
  return collector.build();
}

function generateOrderOfOperationsQuestions(spec, needed, collector) {
  for (let a = 2; a <= 10; a += 2) {
    for (let b = 1; b <= 5; b += 1) {
      for (let c = 2; c <= 4; c += 1) {
        const expressionOne = a + b * c;
        const expressionTwo = (a + b) * c;

        collector.push(
          `What is ${a} + ${b} x ${c}?`,
          expressionOne,
          buildNumericDistractors(expressionOne, -20, 120, a + b + c),
          spec.difficulty_floor,
        );
        collector.push(
          `What is (${a} + ${b}) x ${c}?`,
          expressionTwo,
          buildNumericDistractors(expressionTwo, -20, 120, a + b + c + 1),
          spec.difficulty_ceiling,
        );

        if (collector.enough(needed)) return collector.build();
      }
    }
  }
  return collector.build();
}

function generateSimpleEquationQuestions(spec, needed, collector) {
  for (let answer = 1; answer <= 18; answer += 1) {
    const addend = (answer % 5) + 2;
    const total = answer + addend;
    const minuend = answer + addend + 3;

    collector.push(
      `Solve for x: x + ${addend} = ${total}.`,
      answer,
      buildNumericDistractors(answer, -10, 30, addend),
      spec.difficulty_floor,
    );
    collector.push(
      `Solve for x: ${minuend} - x = ${addend + 3}.`,
      answer,
      buildNumericDistractors(answer, -10, 30, addend + 1),
      spec.difficulty_ceiling,
    );

    if (collector.enough(needed)) return collector.build();
  }
  return collector.build();
}

function generateRateReasoningQuestions(spec, needed, collector) {
  const contexts = [
    { total: 12, groups: 3, noun: "apples", unit: "bag" },
    { total: 18, groups: 6, noun: "miles", unit: "hour" },
    { total: 20, groups: 4, noun: "stickers", unit: "sheet" },
    { total: 24, groups: 8, noun: "pages", unit: "day" },
  ];

  for (const context of contexts) {
    const answer = context.total / context.groups;

    collector.push(
      `If ${context.total} ${context.noun} are shared equally into ${context.groups} ${context.unit}s, how many ${context.noun} go in each ${context.unit}?`,
      answer,
      buildNumericDistractors(answer, 0, 30, context.total),
      spec.difficulty_floor,
    );
    collector.push(
      `A runner goes ${context.total} ${context.noun} in ${context.groups} ${context.unit}s. What is the rate per ${context.unit}?`,
      answer,
      buildNumericDistractors(answer, 0, 30, context.groups),
      spec.difficulty_ceiling,
    );

    if (collector.enough(needed)) return collector.build();
  }
  return collector.build();
}

function generateForceMotionQuestions(spec, needed, collector) {
  return generateFactPromptQuestions(spec, needed, collector, FORCE_MOTION_FACTS, [
    ({ clue }) => `${clue}`,
    ({ clue }) => `Use science reasoning to answer: ${clue}`,
    ({ clue }) => `Which force or motion idea fits this clue best?`,
    ({ clue }) => `Pick the strongest explanation for this motion clue.`,
  ]);
}

function generateEcosystemEvidenceQuestions(spec, needed, collector) {
  return generateFactPromptQuestions(spec, needed, collector, ECOSYSTEM_EVIDENCE_FACTS, [
    ({ clue }) => `${clue}`,
    ({ clue }) => `What does the evidence suggest: ${clue}`,
    ({ clue }) => `Use the ecosystem evidence to choose the best explanation.`,
    ({ clue }) => `Which answer is best supported by this ecosystem clue?`,
  ]);
}

function generateEarthProcessQuestions(spec, needed, collector) {
  return generateFactPromptQuestions(spec, needed, collector, EARTH_PROCESS_FACTS, [
    ({ clue }) => `${clue}`,
    ({ clue }) => `What Earth science idea matches this clue?`,
    ({ clue }) => `Use the Earth-process clue to choose the best answer.`,
    ({ clue }) => `Pick the strongest geology answer for this clue.`,
  ]);
}

function generateMapScaleQuestions(spec, needed, collector) {
  return generateFactPromptQuestions(spec, needed, collector, MAP_SCALE_FACTS, [
    ({ clue }) => `${clue}`,
    ({ clue }) => `Use the map scale clue to answer this question.`,
    ({ clue }) => `What distance best fits this map clue?`,
    ({ clue }) => `Choose the strongest scale-based answer.`,
  ]);
}

function generatePopulationPatternQuestions(spec, needed, collector) {
  return generateFactPromptQuestions(spec, needed, collector, POPULATION_PATTERN_FACTS, [
    ({ clue }) => `${clue}`,
    ({ clue }) => `Use geography reasoning to answer: ${clue}`,
    ({ clue }) => `Which settlement pattern idea fits this clue best?`,
    ({ clue }) => `Pick the strongest population explanation.`,
  ]);
}

function generateConstitutionPrinciplesQuestions(spec, needed, collector) {
  return generateFactPromptQuestions(spec, needed, collector, CONSTITUTION_PRINCIPLES_FACTS, [
    ({ clue }) => `${clue}`,
    ({ clue }) => `What constitutional principle best explains this idea?`,
    ({ clue }) => `Use civics reasoning to answer this clue.`,
    ({ clue }) => `Pick the strongest government-design explanation.`,
  ]);
}

function generateMediaCitizenshipQuestions(spec, needed, collector) {
  return generateFactPromptQuestions(spec, needed, collector, MEDIA_CITIZENSHIP_FACTS, [
    ({ clue }) => `${clue}`,
    ({ clue }) => `What is the most responsible next step?`,
    ({ clue }) => `Use source-checking reasoning to answer this clue.`,
    ({ clue }) => `Pick the strongest digital citizenship move.`,
  ]);
}

function generateArgumentEvidenceQuestions(spec, needed, collector) {
  return generateFactPromptQuestions(spec, needed, collector, ARGUMENT_EVIDENCE_FACTS, [
    ({ clue }) => `${clue}`,
    ({ clue }) => `Which evidence is strongest for this claim?`,
    ({ clue }) => `Use argument reasoning to choose the best support.`,
    ({ clue }) => `Pick the evidence that directly supports the claim.`,
  ]);
}

function generateRevisionPrecisionQuestions(spec, needed, collector) {
  return generateFactPromptQuestions(spec, needed, collector, REVISION_PRECISION_FACTS, [
    ({ clue }) => `${clue}`,
    ({ clue }) => `Which sentence uses the strongest detail?`,
    ({ clue }) => `Choose the most precise revision.`,
    ({ clue }) => `Pick the sentence a reader can picture most clearly.`,
  ]);
}

function generateSourceAnalysisQuestions(spec, needed, collector) {
  return generateFactPromptQuestions(spec, needed, collector, SOURCE_ANALYSIS_FACTS, [
    ({ clue }) => `${clue}`,
    ({ clue }) => `Use source analysis to choose the best answer.`,
    ({ clue }) => `Which answer best matches this sourcing clue?`,
    ({ clue }) => `Pick the strongest historian-style answer.`,
  ]);
}

function generateMultiStepPatternQuestions(spec, needed, collector) {
  const patterns = [
    { start: 2, deltas: [3, 5], answer: 18, prompt: "What comes next: 2, 5, 10, 13, ?" },
    { start: 4, deltas: [2, 4], answer: 16, prompt: "What comes next: 4, 6, 10, 12, ?" },
    { start: 7, deltas: [-2, 4], answer: 11, prompt: "What comes next: 7, 5, 9, 7, ?" },
    { start: 3, deltas: [4, 1], answer: 13, prompt: "What comes next: 3, 7, 8, 12, ?" },
  ];

  for (let patternIndex = 0; patternIndex < patterns.length; patternIndex += 1) {
    const pattern = patterns[patternIndex];
    collector.push(
      pattern.prompt,
      pattern.answer,
      buildNumericDistractors(pattern.answer, -20, 40, patternIndex),
      spec.difficulty_floor,
    );
    collector.push(
      `A number pattern changes by ${pattern.deltas[0]} and then ${pattern.deltas[1]}. ${pattern.prompt}`,
      pattern.answer,
      buildNumericDistractors(pattern.answer, -20, 40, patternIndex + 1),
      spec.difficulty_ceiling,
    );

    if (collector.enough(needed)) return collector.build();
  }
  return collector.build();
}

const GENERATORS = {
  letter: generateLetterQuestions,
  count: generateCountQuestions,
  shape: generateShapeQuestions,
  "bigger-smaller": generateBiggerSmallerQuestions,
  rhyme: generateRhymeQuestions,
  color: generateColorQuestions,
  "land-water": generateLandWaterQuestions,
  "place-clue": generatePlaceClueQuestions,
  "community-helper": generateCommunityHelperQuestions,
  "safe-choice": generateSafeChoiceQuestions,
  "short-vowel": generateShortVowelQuestions,
  "word-pick": generateWordPickQuestions,
  "add-within-10": generateAddWithinTenQuestions,
  "subtract-within-10": generateSubtractWithinTenQuestions,
  "number-bonds": generateNumberBondQuestions,
  "map-symbols": generateMapSymbolQuestions,
  "landform-clues": generateLandformClueQuestions,
  "community-services": generateCommunityServicesQuestions,
  fairness: generateFairnessQuestions,
  "main-idea": generateMainIdeaQuestions,
  "cause-effect": generateCauseEffectQuestions,
  "add-3-digit": generateAdd3DigitQuestions,
  multiplication: generateMultiplicationQuestions,
  "time-to-hour": generateTimeToHourQuestions,
  "skip-count": generateSkipCountQuestions,
  "compare-numbers": generateCompareNumbersQuestions,
  pattern: generatePatternQuestions,
  continents: generateContinentQuestions,
  "region-climate": generateRegionClimateQuestions,
  "branches-intro": generateBranchesIntroQuestions,
  "citizen-actions": generateCitizenActionQuestions,
  fractions: generateFractionQuestions,
  decimals: generateDecimalQuestions,
  percents: generatePercentQuestions,
  ratios: generateRatioQuestions,
  "context-clues": generateContextClueQuestions,
  "text-evidence": generateTextEvidenceQuestions,
  inference: generateInferenceQuestions,
  engineering: generateEngineeringQuestions,
  "latitude-longitude": generateLatitudeLongitudeQuestions,
  "human-physical": generateHumanPhysicalQuestions,
  "branches-powers": generateBranchesPowersQuestions,
  "election-process": generateElectionProcessQuestions,
  weather: generateWeatherQuestions,
  "sentence-completion": generateSentenceCompletionQuestions,
  "past-present": generatePastPresentQuestions,
  "life-cycle": generateLifeCycleQuestions,
  "paragraph-sequence": generateParagraphSequenceQuestions,
  "timeline-order": generateTimelineOrderQuestions,
  "ecosystem-change": generateEcosystemChangeQuestions,
  "revision-choice": generateRevisionChoiceQuestions,
  "historical-cause": generateHistoricalCauseQuestions,
  "author-claim": generateAuthorClaimQuestions,
  "theme-analysis": generateThemeAnalysisQuestions,
  "integer-number-line": generateIntegerNumberLineQuestions,
  "order-of-operations": generateOrderOfOperationsQuestions,
  "simple-equations": generateSimpleEquationQuestions,
  "rate-reasoning": generateRateReasoningQuestions,
  "force-motion": generateForceMotionQuestions,
  "ecosystem-evidence": generateEcosystemEvidenceQuestions,
  "earth-processes": generateEarthProcessQuestions,
  "map-scale": generateMapScaleQuestions,
  "population-patterns": generatePopulationPatternQuestions,
  "constitution-principles": generateConstitutionPrinciplesQuestions,
  "media-citizenship": generateMediaCitizenshipQuestions,
  "argument-evidence": generateArgumentEvidenceQuestions,
  "revision-precision": generateRevisionPrecisionQuestions,
  "source-analysis": generateSourceAnalysisQuestions,
  "multi-step-patterns": generateMultiStepPatternQuestions,
};

const BAND_TARGETS = resolveBandTargets();
const ACTIVE_SKILL_SPECS = scaleSkillSpecs(SKILL_SPECS, BAND_TARGETS);

function sqlValue(value) {
  if (value === null || value === undefined) return "null";
  if (typeof value === "number") return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
}

function buildLaunchSeedSql() {
  const themeValues = THEME_FAMILIES.map(
    (item) => `  (${sqlValue(item.code)}, ${sqlValue(item.display_name)}, ${sqlValue(item.description)})`,
  ).join(",\n");

  const bandValues = LAUNCH_BANDS.map(
    (item) =>
      `  (${sqlValue(item.code)}, ${sqlValue(item.display_name)}, ${item.sort_order}, ${sqlValue(item.age_min)}, ${sqlValue(item.age_max)}, ${sqlValue(item.grade_min)}, ${sqlValue(item.grade_max)}, ${sqlValue(item.primary_theme_code)}, ${sqlValue(item.audience_label)})`,
  ).join(",\n");

  const subjectValues = SUBJECTS.map(
    (item) => `  (${sqlValue(item.code)}, ${sqlValue(item.display_name)})`,
  ).join(",\n");

  return [
    "insert into public.theme_families (code, display_name, description)",
    "values",
    `${themeValues}`,
    "on conflict (code) do nothing;",
    "",
    "insert into public.launch_bands (",
    "  code,",
    "  display_name,",
    "  sort_order,",
    "  age_min,",
    "  age_max,",
    "  grade_min,",
    "  grade_max,",
    "  primary_theme_code,",
    "  audience_label",
    ")",
    "values",
    `${bandValues}`,
    "on conflict (code) do nothing;",
    "",
    "insert into public.subjects (code, display_name)",
    "values",
    `${subjectValues}`,
    "on conflict (code) do nothing;",
    "",
  ].join("\n");
}

function buildContentSeedSql(skillSpecs, templates) {
  const skillValues = skillSpecs.map(
    (item) =>
      `  (${sqlValue(item.code)}, ${sqlValue(item.subject)}, ${sqlValue(item.launch_band)}, ${sqlValue(item.display_name)}, ${sqlValue(item.description)}, ${item.difficulty_floor}, ${item.difficulty_ceiling})`,
  ).join(",\n");

  const templateValues = templates.map(
    (item) =>
      `  (${sqlValue(item.template_key)}, ${sqlValue(item.subject)}, ${sqlValue(item.launch_band)}, ${sqlValue(item.modality)}, ${sqlValue(item.reading_load)}, ${sqlValue(item.prompt_pattern)}, ${sqlValue(item.answer_pattern)}, ${sqlValue(item.explanation_pattern)})`,
  ).join(",\n");

  return [
    "insert into public.skills (",
    "  code,",
    "  subject_code,",
    "  launch_band_code,",
    "  display_name,",
    "  description,",
    "  difficulty_floor,",
    "  difficulty_ceiling",
    ")",
    "values",
    `${skillValues}`,
    "on conflict (code) do nothing;",
    "",
    "insert into public.content_templates (",
    "  template_key,",
    "  subject_code,",
    "  launch_band_code,",
    "  modality,",
    "  reading_load,",
    "  prompt_pattern,",
    "  answer_pattern,",
    "  explanation_pattern",
    ")",
    "values",
    `${templateValues}`,
    "on conflict (template_key) do nothing;",
    "",
  ].join("\n");
}

function buildLaunchBandOverview() {
  const themeLabels = new Map(
    THEME_FAMILIES.map((item) => [item.code, item.display_name]),
  );

  return LAUNCH_BANDS.map((item) => ({
    code: item.code,
    display_name: item.display_name,
    audience: item.audience_label,
    primary_theme: item.primary_theme_code,
    theme_label: themeLabels.get(item.primary_theme_code) ?? titleCase(item.primary_theme_code),
    focus: LAUNCH_BAND_FOCUS[item.code] ?? [],
  }));
}

async function main() {
  const [existingQuestions, existingExplainers] = await Promise.all([
    loadJson(QUESTION_BANK_FILE),
    loadJson("explainers.json"),
  ]);

  const generatedExplainerKeys = new Set(GENERATED_EXPLAINERS.map((item) => item.explainer_key));
  const explainers = [
    ...existingExplainers.filter((item) => !generatedExplainerKeys.has(item.explainer_key)),
    ...GENERATED_EXPLAINERS,
  ].sort((left, right) => {
    const bandDiff = BAND_ORDER.indexOf(left.launch_band) - BAND_ORDER.indexOf(right.launch_band);
    if (bandDiff !== 0) return bandDiff;
    return left.explainer_key.localeCompare(right.explainer_key);
  });

  const explainersBySkill = new Map();
  for (const question of existingQuestions) {
    const explainersForSkill = explainersBySkill.get(question.skill) ?? [];
    explainersForSkill.push(question.explainer_key);
    explainersBySkill.set(question.skill, explainersForSkill);
  }

  for (const spec of ACTIVE_SKILL_SPECS) {
    if (!explainersBySkill.has(spec.code)) {
      const fallback = GENERATED_EXPLAINERS.find((item) => item.launch_band === spec.launch_band && item.subject === spec.subject);
      if (fallback) {
        explainersBySkill.set(spec.code, [fallback.explainer_key]);
      }
    }
  }

  const existingBySkill = new Map();
  for (const question of existingQuestions) {
    const module = question.module ?? MODULE_BY_SUBJECT[question.subject] ?? "general";
    const enriched = {
      ...question,
      module,
      prompt: sanitizeQuestionPrompt(question.prompt),
    };
    const list = existingBySkill.get(question.skill) ?? [];
    list.push(enriched);
    existingBySkill.set(question.skill, list);
  }

  const finalQuestions = [];
  for (const spec of ACTIVE_SKILL_SPECS) {
    const existing = existingBySkill.get(spec.code) ?? [];
    finalQuestions.push(...existing);

    const needed = spec.target_count - existing.length;
    if (needed <= 0) {
      continue;
    }

    const explainerKeys = uniqueValues(explainersBySkill.get(spec.code) ?? []);
    if (!explainerKeys.length) {
      throw new Error(`No explainer keys found for skill ${spec.code}`);
    }

    const collector = createCollector(spec, existing.length, explainerKeys);
    const generator = GENERATORS[spec.generator];
    if (!generator) {
      throw new Error(`No generator registered for ${spec.generator}`);
    }

    let created = generator(spec, needed, collector);
    if (created.length < needed) {
      created = topUpQuestions(
        spec,
        existing.length,
        explainerKeys,
        created,
        needed,
      );
    }
    if (created.length < needed) {
      throw new Error(`Generator ${spec.generator} only produced ${created.length} items for ${spec.code}; needed ${needed}.`);
    }

    finalQuestions.push(...created.slice(0, needed));
  }

  const totalsByBand = finalQuestions.reduce((acc, question) => {
    acc[question.launch_band] = (acc[question.launch_band] ?? 0) + 1;
    return acc;
  }, {});

  for (const [band, target] of Object.entries(BAND_TARGETS)) {
    if ((totalsByBand[band] ?? 0) !== target) {
      throw new Error(`Band ${band} total ${totalsByBand[band] ?? 0} did not match target ${target}.`);
    }
  }

  const grandTotal = finalQuestions.length;
  if (grandTotal !== Object.values(BAND_TARGETS).reduce((sum, value) => sum + value, 0)) {
    throw new Error(`Total question count ${grandTotal} did not match overall target.`);
  }

  const skills = sortByBandThenCode(ACTIVE_SKILL_SPECS);
  const templates = sortByBandThenCode(CONTENT_TEMPLATES, "template_key");
  const questions = [...finalQuestions].sort((left, right) => {
    const bandDiff = BAND_ORDER.indexOf(left.launch_band) - BAND_ORDER.indexOf(right.launch_band);
    if (bandDiff !== 0) return bandDiff;
    const moduleDiff = left.module.localeCompare(right.module);
    if (moduleDiff !== 0) return moduleDiff;
    const skillDiff = left.skill.localeCompare(right.skill);
    if (skillDiff !== 0) return skillDiff;
    return left.question_key.localeCompare(right.question_key);
  });

  await Promise.all([
    writeCompressedJson(QUESTION_BANK_FILE, questions),
    writeFile(path.resolve(DATA_DIR, "skills.json"), serializeJson(skills)),
    writeFile(path.resolve(DATA_DIR, "explainers.json"), serializeJson(explainers)),
    writeFile(path.resolve(DATA_DIR, "content_templates.json"), serializeJson(templates)),
    writeFile(path.resolve(DATA_DIR, "launch_bands.json"), serializeJson(buildLaunchBandOverview())),
    writeFile(path.resolve(DATA_DIR, "avatars.json"), serializeJson(AVATARS)),
    writeFile(path.resolve(SEED_DIR, "launch_seed.sql"), buildLaunchSeedSql()),
    writeFile(path.resolve(SEED_DIR, "content_seed.sql"), buildContentSeedSql(skills, templates)),
  ]);

  const summary = {
    configuredTargetTotal: sumValues(BAND_TARGETS),
    totalQuestions: questions.length,
    questionBankArtifact: `${QUESTION_BANK_FILE}.gz`,
    totalsByBand,
    skillCount: skills.length,
    explainerCount: explainers.length,
    templateCount: templates.length,
    modules: questions.reduce((acc, question) => {
      acc[question.module] = (acc[question.module] ?? 0) + 1;
      return acc;
    }, {}),
  };

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

await main();
