"use strict";

const STORAGE_KEY = "soccerQuestBestScore";
const ACTIVITY_SEQUENCE = ["readingChallenge", "mathChallenge", "shapeChallenge"];
const ACTIVITY_LABELS = {
  readingChallenge: "Reading Play",
  mathChallenge: "Number Play",
  shapeChallenge: "Shape Play",
};
const POINT_RULES = {
  reading: { first: 20, retry: 10 },
  math: { first: 25, retry: 15 },
  shape: { first: 20, retry: 10 },
  levelClear: 30,
  perfectLevel: 20,
  streakStep: 10,
  streakCap: 30,
};
const ANIMATION_KEYS = {
  scorePop: "score-pop",
  kick: "kick-transition",
  correct: "is-correct",
  wrong: "is-wrong",
};
const PLAYER_REFS = [
  {
    name: "Lionel Messi",
    role: "Vision captain",
    accentColor: "#40c8ff",
    cheer: "Messi energy: stay calm, scan the field, and choose the smart answer.",
    facts: [
      {
        label: "Birthday",
        text: "Lionel Messi was born on June 24, 1987, in Rosario, Argentina.",
      },
      {
        label: "Goals",
        text: "Inter Miami says Messi won the 2025 MLS Golden Boot with 29 regular-season goals in 28 matches.",
      },
      {
        label: "Record",
        text: "Britannica says Messi owns a record eight Ballon d'Or awards.",
      },
      {
        label: "Trophy",
        text: "Messi captained Argentina to the 2022 FIFA World Cup title.",
      },
    ],
  },
  {
    name: "Alex Morgan",
    role: "Quick pass leader",
    accentColor: "#ff8a6b",
    cheer: "Alex Morgan style: move with confidence and finish the play strong.",
    facts: [
      {
        label: "Birthday",
        text: "Alex Morgan was born on July 2, 1989, in Diamond Bar, California.",
      },
      {
        label: "Goals",
        text: "U.S. Soccer lists Alex Morgan with 123 goals in 224 USWNT appearances.",
      },
      {
        label: "Firsts",
        text: "U.S. Soccer says Morgan's first national-team goal came against China PR in 2010.",
      },
      {
        label: "Caps",
        text: "Morgan became the 13th USWNT player to reach 200 caps in 2022.",
      },
    ],
  },
  {
    name: "Kylian Mbappe",
    role: "Fast break star",
    accentColor: "#6f7cff",
    cheer: "Mbappe pace: when you see the pattern, strike fast and stay sharp.",
    facts: [
      {
        label: "Birthday",
        text: "Kylian Mbappe was born on December 20, 1998, in Paris, France.",
      },
      {
        label: "Goals",
        text: "Ligue 1 says Mbappe reached 191 league goals in France by the end of 2025.",
      },
      {
        label: "Scoring run",
        text: "Real Madrid marked Mbappe's 27th birthday by noting 58 goals in 57 matches during 2025.",
      },
      {
        label: "World Cup",
        text: "FIFA says Mbappe won the Golden Boot at the 2022 World Cup with 8 goals.",
      },
    ],
  },
  {
    name: "Sam Kerr",
    role: "Defense boss",
    accentColor: "#ffcb47",
    cheer: "Sam Kerr focus: a smart team reads first and shares the ball well.",
    facts: [
      {
        label: "Birthday",
        text: "Sam Kerr was born on September 10, 1993, in East Fremantle, Australia.",
      },
      {
        label: "Goals",
        text: "The Matildas profile lists Sam Kerr with 69 goals in 131 international caps.",
      },
      {
        label: "Record",
        text: "Football Australia says Kerr is the Matildas' all-time leading scorer.",
      },
      {
        label: "Golden Boot",
        text: "Chelsea lists Kerr as the 2020-21 WSL Golden Boot winner with 21 league goals.",
      },
    ],
  },
  {
    name: "Cristiano Ronaldo",
    role: "Training finisher",
    accentColor: "#2ed089",
    cheer: "Ronaldo drive: repeat the basics, then hit the answer with power.",
    facts: [
      {
        label: "Birthday",
        text: "Cristiano Ronaldo was born on February 5, 1985, in Funchal, Madeira.",
      },
      {
        label: "Goals",
        text: "Britannica says Ronaldo became the first men's player to reach 900 official goals in 2024.",
      },
      {
        label: "World Cups",
        text: "FIFA says Ronaldo was the first men's player to score in five different World Cups.",
      },
      {
        label: "Caps",
        text: "FIFA says Ronaldo set the men's international appearance record in 2023.",
      },
    ],
  },
  {
    name: "Sophia Smith",
    role: "Cup final closer",
    accentColor: "#f07cd4",
    cheer: "Sophia Smith spark: keep your head up and finish the match with joy.",
    facts: [
      {
        label: "Birthday",
        text: "Sophia Smith was born on August 10, 2000, in Windsor, Colorado.",
      },
      {
        label: "Goals",
        text: "U.S. Soccer lists Sophia Smith with 24 goals in 58 USWNT appearances.",
      },
      {
        label: "Firsts",
        text: "U.S. Soccer says Smith was the first player born in the 2000s to earn a USWNT cap.",
      },
      {
        label: "Award",
        text: "U.S. Soccer named Sophia Smith the 2022 Female Player of the Year.",
      },
    ],
  },
];
const LEVELS = [
  {
    id: 1,
    title: "Warm-Up Words",
    theme: "Tunnel lights, soft passes, and a calm first touch.",
    rewardLabel: "Opening whistle addition bonus",
    mentorIndex: 0,
    storyText:
      "Lionel Messi waits by the tunnel and reminds you that the best players read the field before they pass.",
    readingChallenge: {
      type: "reading",
      prompt: "Finish the sentence: The ball is ___ the goal.",
      hint: "Pick the word that makes the sentence sound right.",
      options: ["near", "sleep", "paint", "banana"],
      correctIndex: 0,
      successText: "Nice read. You picked the word that fits the play.",
      retryText: "Try again. Read the full sentence one more time.",
      visual: {
        kind: "readingCard",
        title: "Sentence board",
        text: "The ball is near the goal, and the player is ready to score.",
        chips: ["ball", "near", "goal"],
      },
    },
    mathChallenge: {
      type: "math",
      prompt: "The home team has 24 practice points in the first half and 13 in the second half. How many points is that in all?",
      hint: "Add the ones first, then add the tens.",
      options: ["35", "36", "37", "38"],
      correctIndex: 2,
      successText: "Great job. 24 plus 13 makes 37.",
      retryText: "Add the two-digit numbers one more time.",
      visual: {
        kind: "numberBoard",
        title: "Scoreboard math",
        equation: "24 + 13 = ?",
        note: "First-half points plus second-half points",
        tokens: ["24", "+13", "= ?"],
      },
    },
    shapeChallenge: {
      type: "shape",
      prompt: "Which shape matches a soccer ball?",
      hint: "Look for the shape with no sides and no corners.",
      options: ["Circle", "Triangle", "Rectangle", "Pentagon"],
      correctIndex: 0,
      successText: "Correct. A soccer ball looks round like a circle.",
      retryText: "Look for the round shape and try again.",
      visual: {
        kind: "shapeRow",
        title: "Shape line-up",
        shapes: ["circle", "triangle", "rectangle", "pentagon"],
      },
    },
  },
  {
    id: 2,
    title: "Quick Pass Stories",
    theme: "Sideline runs and crisp passes down the wing.",
    rewardLabel: "Fast pass subtraction bonus",
    mentorIndex: 1,
    storyText:
      "Alex Morgan sprints down the sideline and wants a quick pass, but only after you read the play card.",
    readingChallenge: {
      type: "reading",
      prompt: "Read the sentence: Alex passes to the open teammate. Who gets the ball?",
      hint: "Answer with the person named in the sentence.",
      options: ["The open teammate", "The coach", "The clouds", "The referee"],
      correctIndex: 0,
      successText: "Correct. You followed the sentence to the right player.",
      retryText: "Go back to the sentence and find who receives the pass.",
      visual: {
        kind: "readingCard",
        title: "Play card",
        text: "Alex passes to the open teammate near the sideline.",
        chips: ["Alex", "passes", "open teammate"],
      },
    },
    mathChallenge: {
      type: "math",
      prompt: "The coach set out 58 cones and picked up 24. How many cones are still on the field?",
      hint: "Subtract the ones and then subtract the tens.",
      options: ["32", "33", "34", "35"],
      correctIndex: 2,
      successText: "Correct. 58 minus 24 leaves 34 cones.",
      retryText: "Take away 24 from 58 and try again.",
      visual: {
        kind: "numberBoard",
        title: "Cone count board",
        equation: "58 - 24 = ?",
        note: "Cones left after cleanup",
        tokens: ["58", "-24", "= ?"],
      },
    },
    shapeChallenge: {
      type: "shape",
      prompt: "Which shape has 4 sides and 4 corners, but is longer than it is tall?",
      hint: "It looks like a scoreboard screen.",
      options: ["Square", "Rectangle", "Circle", "Triangle"],
      correctIndex: 1,
      successText: "Right. A rectangle is longer than it is tall.",
      retryText: "Look for the shape that stretches wide.",
      visual: {
        kind: "shapeRow",
        title: "Scoreboard shapes",
        shapes: ["square", "rectangle", "circle", "triangle"],
      },
    },
  },
  {
    id: 3,
    title: "Crossbar Count",
    theme: "Bright lights, fast feet, and a crossbar challenge.",
    rewardLabel: "Crossbar multiplication bonus",
    mentorIndex: 2,
    storyText:
      "Kylian Mbappe races to the crossbar game and says quick thinking helps when the pattern becomes easy to see.",
    readingChallenge: {
      type: "reading",
      prompt: "Choose the word that finishes the sentence: The keeper will ___ the shot.",
      hint: "Pick the action word that fits soccer.",
      options: ["block", "sleep", "banana", "paint"],
      correctIndex: 0,
      successText: "Well done. The sentence now makes perfect soccer sense.",
      retryText: "Look for the word that tells what the keeper does.",
      visual: {
        kind: "readingCard",
        title: "Crossbar clue",
        text: "The keeper dives across the goal and will block the shot.",
        chips: ["keeper", "block", "shot"],
      },
    },
    mathChallenge: {
      type: "math",
      prompt: "Each gear bag holds 12 training bibs. If there are 3 bags, how many bibs are there altogether?",
      hint: "Count 12 three times or multiply 12 x 3.",
      options: ["34", "35", "36", "37"],
      correctIndex: 2,
      successText: "Yes. 12 times 3 equals 36 bibs.",
      retryText: "Try the multiplication again: 12 x 3.",
      visual: {
        kind: "numberBoard",
        title: "Training bag board",
        equation: "12 x 3 = ?",
        note: "Bibs in 3 equal gear bags",
        tokens: ["12", "x3", "= ?"],
      },
    },
    shapeChallenge: {
      type: "shape",
      prompt: "Which shape on a soccer ball has 5 sides?",
      hint: "Count the sides of the special shape.",
      options: ["Triangle", "Square", "Pentagon", "Circle"],
      correctIndex: 2,
      successText: "Correct. A pentagon has 5 sides.",
      retryText: "Count the sides one more time.",
      visual: {
        kind: "shapeRow",
        title: "Soccer ball pattern",
        shapes: ["triangle", "square", "pentagon", "circle"],
      },
    },
  },
  {
    id: 4,
    title: "Defense and Sharing",
    theme: "Strong defending and sharing the gear evenly.",
    rewardLabel: "Defense division bonus",
    mentorIndex: 3,
    storyText:
      "Sam Kerr sets the defense and reminds the team that smart players read first and share the ball fairly.",
    readingChallenge: {
      type: "reading",
      prompt: "Read the clue: The defender runs back to stop the shot. What is the defender trying to stop?",
      hint: "Find the thing named at the end of the clue.",
      options: ["A shot", "A sandwich", "A song", "A nap"],
      correctIndex: 0,
      successText: "Exactly. The defender is trying to stop the shot.",
      retryText: "Read the clue again and look at the final word.",
      visual: {
        kind: "readingCard",
        title: "Defense clue",
        text: "The defender runs back to stop the shot before it reaches the goal.",
        chips: ["defender", "stop", "shot"],
      },
    },
    mathChallenge: {
      type: "math",
      prompt: "48 stickers are shared equally between 4 defenders. How many stickers does each defender get?",
      hint: "Think of 48 split into 4 equal groups.",
      options: ["10", "11", "12", "13"],
      correctIndex: 2,
      successText: "Right. 48 divided by 4 gives each defender 12 stickers.",
      retryText: "Share 48 into 4 equal groups and count again.",
      visual: {
        kind: "numberBoard",
        title: "Sticker share board",
        equation: "48 / 4 = ?",
        note: "Equal share for 4 defenders",
        tokens: ["48", "/4", "= ?"],
      },
    },
    shapeChallenge: {
      type: "shape",
      prompt: "Which shape looks like the corner flag on the field?",
      hint: "The flag has 3 sides.",
      options: ["Triangle", "Circle", "Square", "Rectangle"],
      correctIndex: 0,
      successText: "Correct. The corner flag looks like a triangle.",
      retryText: "Look for the shape with 3 sides.",
      visual: {
        kind: "shapeRow",
        title: "Corner flag shapes",
        shapes: ["triangle", "circle", "square", "rectangle"],
      },
    },
  },
  {
    id: 5,
    title: "Shape of the Play",
    theme: "Training cones, smart corners, and calm passing.",
    rewardLabel: "Training ground addition bonus",
    mentorIndex: 4,
    storyText:
      "Cristiano Ronaldo lines up the cones and challenges you to finish each play with sharp focus and simple shapes.",
    readingChallenge: {
      type: "reading",
      prompt: "Read the play: Mia dribbles, stops, then passes to Ben. Who gets the pass at the end?",
      hint: "Follow the last action in the sentence.",
      options: ["Ben", "Mia", "The coach", "The crowd"],
      correctIndex: 0,
      successText: "Great job. You followed the actions in order.",
      retryText: "Look at the end of the sentence to find who gets the ball.",
      visual: {
        kind: "readingCard",
        title: "Training play",
        text: "Mia dribbles, stops, then passes to Ben near the cone line.",
        chips: ["Mia", "passes", "Ben"],
      },
    },
    mathChallenge: {
      type: "math",
      prompt: "One team has 36 warm-up passes and then makes 27 more. How many passes do they have now?",
      hint: "Add 36 and 27 by combining tens and ones.",
      options: ["61", "62", "63", "64"],
      correctIndex: 2,
      successText: "Correct. 36 plus 27 equals 63.",
      retryText: "Put the two-digit numbers together again.",
      visual: {
        kind: "numberBoard",
        title: "Pass counter board",
        equation: "36 + 27 = ?",
        note: "Warm-up passes plus extra passes",
        tokens: ["36", "+27", "= ?"],
      },
    },
    shapeChallenge: {
      type: "shape",
      prompt: "How many corners does a square have?",
      hint: "Count each corner one by one.",
      options: ["3", "4", "5", "6"],
      correctIndex: 1,
      successText: "Correct. A square has 4 corners.",
      retryText: "Look at the square and count each corner carefully.",
      visual: {
        kind: "shapeRow",
        title: "Corner count",
        shapes: ["square"],
      },
    },
  },
  {
    id: 6,
    title: "Cup Final Mix",
    theme: "Championship lights and one last smart attack.",
    rewardLabel: "Cup final division bonus",
    mentorIndex: 5,
    storyText:
      "Sophia Smith leads the final run and says one more smart match will bring the cup all the way home.",
    readingChallenge: {
      type: "reading",
      prompt: "Read the note: Pass early, move fast, and look up. What should you do first?",
      hint: "Pick the very first action in the note.",
      options: ["Pass early", "Take a nap", "Hide the ball", "Leave the field"],
      correctIndex: 0,
      successText: "Perfect. You found the first step in the note.",
      retryText: "Start at the beginning of the note and read the first action.",
      visual: {
        kind: "readingCard",
        title: "Final note",
        text: "Pass early, move fast, and look up before the final shot.",
        chips: ["Pass early", "move fast", "look up"],
      },
    },
    mathChallenge: {
      type: "math",
      prompt: "84 rally towels are shared equally between 7 players. How many towels does each player get?",
      hint: "Think about what number times 7 equals 84.",
      options: ["10", "11", "12", "13"],
      correctIndex: 2,
      successText: "Correct. 84 divided by 7 gives 12 towels each.",
      retryText: "Try the division again and look for equal groups of 7.",
      visual: {
        kind: "numberBoard",
        title: "Final share board",
        equation: "84 / 7 = ?",
        note: "Championship towels shared equally",
        tokens: ["84", "/7", "= ?"],
      },
    },
    shapeChallenge: {
      type: "shape",
      prompt: "Which shape has 3 sides?",
      hint: "Think about the shape on the corner flag.",
      options: ["Triangle", "Circle", "Pentagon", "Rectangle"],
      correctIndex: 0,
      successText: "Right. A triangle has 3 sides.",
      retryText: "Count the sides of each shape and try again.",
      visual: {
        kind: "shapeRow",
        title: "Final shape line-up",
        shapes: ["triangle", "circle", "pentagon", "rectangle"],
      },
    },
  },
];

const refs = {};
const gameState = {
  started: false,
  screen: "start",
  currentLevel: 0,
  currentActivityIndex: 0,
  currentScore: 0,
  bestScore: loadBestScore(),
  streakCount: 0,
  feedbackMessage: "Tap the best answer to score points.",
  feedbackTone: "",
  rewardContext: null,
  levelResults: [],
};

document.addEventListener("DOMContentLoaded", () => {
  cacheRefs();
  bindEvents();
  resetSessionState();
  renderApp();
});

function cacheRefs() {
  refs.heroActionButton = document.getElementById("heroActionButton");
  refs.heroResetButton = document.getElementById("heroResetButton");
  refs.startJourneyButton = document.getElementById("startJourneyButton");
  refs.currentScore = document.getElementById("currentScore");
  refs.currentLevelDisplay = document.getElementById("currentLevelDisplay");
  refs.streakDisplay = document.getElementById("streakDisplay");
  refs.bestScore = document.getElementById("bestScore");
  refs.sessionStateChip = document.getElementById("sessionStateChip");
  refs.pathMap = document.getElementById("pathMap");
  refs.mentorCard = document.getElementById("mentorCard");
  refs.playPanel = document.getElementById("playPanel");
  refs.screenStart = document.getElementById("screenStart");
  refs.screenChallenge = document.getElementById("screenChallenge");
  refs.screenReward = document.getElementById("screenReward");
  refs.screenFinish = document.getElementById("screenFinish");
  refs.levelTag = document.getElementById("levelTag");
  refs.levelTitle = document.getElementById("levelTitle");
  refs.levelTheme = document.getElementById("levelTheme");
  refs.activityProgress = document.getElementById("activityProgress");
  refs.storyScene = document.getElementById("storyScene");
  refs.factPanel = document.getElementById("factPanel");
  refs.challengeCard = document.getElementById("challengeCard");
  refs.challengeTypeLabel = document.getElementById("challengeTypeLabel");
  refs.pointsHint = document.getElementById("pointsHint");
  refs.challengePrompt = document.getElementById("challengePrompt");
  refs.challengeHint = document.getElementById("challengeHint");
  refs.visualBoard = document.getElementById("visualBoard");
  refs.choiceGrid = document.getElementById("choiceGrid");
  refs.feedbackMessage = document.getElementById("feedbackMessage");
  refs.nextActionButton = document.getElementById("nextActionButton");
  refs.rewardTitle = document.getElementById("rewardTitle");
  refs.rewardSummary = document.getElementById("rewardSummary");
  refs.rewardLevelPoints = document.getElementById("rewardLevelPoints");
  refs.rewardTotalPoints = document.getElementById("rewardTotalPoints");
  refs.rewardStars = document.getElementById("rewardStars");
  refs.rewardQuote = document.getElementById("rewardQuote");
  refs.continueButton = document.getElementById("continueButton");
  refs.finishSummary = document.getElementById("finishSummary");
  refs.finishScore = document.getElementById("finishScore");
  refs.finishBestScore = document.getElementById("finishBestScore");
  refs.finishRank = document.getElementById("finishRank");
  refs.playAgainButton = document.getElementById("playAgainButton");
  refs.transitionBall = document.getElementById("transitionBall");
  refs.burstLayer = document.getElementById("burstLayer");
  refs.scoreCardCurrent = document.getElementById("scoreCardCurrent");
  refs.scoreCardLevel = document.getElementById("scoreCardLevel");
  refs.scoreCardStreak = document.getElementById("scoreCardStreak");
  refs.scoreCardBest = document.getElementById("scoreCardBest");
}

function bindEvents() {
  refs.heroActionButton.addEventListener("click", handleHeroAction);
  refs.heroResetButton.addEventListener("click", startJourney);
  refs.startJourneyButton.addEventListener("click", startJourney);
  refs.choiceGrid.addEventListener("click", handleChoiceClick);
  refs.nextActionButton.addEventListener("click", advanceAfterCorrectAnswer);
  refs.continueButton.addEventListener("click", continueToNextLevel);
  refs.playAgainButton.addEventListener("click", startJourney);
}

function handleHeroAction() {
  if (!gameState.started || gameState.screen === "start" || gameState.screen === "finish") {
    startJourney();
    return;
  }

  refs.playPanel.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  refs.playPanel.focus();
}

function startJourney() {
  resetSessionState();
  gameState.started = true;
  gameState.screen = "challenge";
  gameState.feedbackMessage = "Tap the best answer to score points.";
  gameState.feedbackTone = "";
  triggerKickTransition();
  renderApp();
  refs.playPanel.focus();
}

function resetSessionState() {
  gameState.currentLevel = 0;
  gameState.currentActivityIndex = 0;
  gameState.currentScore = 0;
  gameState.streakCount = 0;
  gameState.rewardContext = null;
  gameState.levelResults = LEVELS.map(() => createEmptyLevelResult());
}

function createEmptyLevelResult() {
  return {
    completed: false,
    perfect: true,
    score: 0,
    bonus: 0,
    activities: ACTIVITY_SEQUENCE.reduce((accumulator, activityKey) => {
      accumulator[activityKey] = {
        attempts: 0,
        resolved: false,
        awarded: 0,
        firstTry: false,
        streakBonus: 0,
        lastWrongChoice: null,
      };
      return accumulator;
    }, {}),
  };
}

function renderApp() {
  updateHeroButtons();
  updateScoreboard();
  renderPathMap();
  renderMentorCard();
  renderSessionChip();
  renderActiveScreen();
}

function updateHeroButtons() {
  if (!gameState.started || gameState.screen === "start") {
    refs.heroActionButton.textContent = "Start Match Day";
  } else if (gameState.screen === "finish") {
    refs.heroActionButton.textContent = "Play Again";
  } else {
    refs.heroActionButton.textContent = "Back to Match";
  }
}

function updateScoreboard() {
  refs.currentScore.textContent = String(gameState.currentScore);
  refs.bestScore.textContent = String(gameState.bestScore);
  refs.streakDisplay.textContent = streakBonusLabel();

  const finished = gameState.screen === "finish";
  const displayLevel = gameState.started ? Math.min(gameState.currentLevel + (finished ? 1 : 1), LEVELS.length) : 0;
  refs.currentLevelDisplay.textContent = `${displayLevel} / ${LEVELS.length}`;
}

function streakBonusLabel() {
  if (!gameState.streakCount) {
    return "0";
  }

  return `+${Math.min(gameState.streakCount * POINT_RULES.streakStep, POINT_RULES.streakCap)}`;
}

function renderPathMap() {
  const nodes = LEVELS.map((level, index) => {
    const levelResult = gameState.levelResults[index];
    let stateClass = "is-locked";

    if (levelResult.completed) {
      stateClass = "is-done";
    } else if (gameState.started && index === gameState.currentLevel && gameState.screen !== "finish") {
      stateClass = "is-current";
    }

    if (!gameState.started && index === 0) {
      stateClass = "is-current";
    }

    const stateLabel = levelResult.completed
      ? "Level cleared"
      : stateClass === "is-current"
        ? "Current level"
        : "Locked";

    return `
      <article class="path-node ${stateClass}">
        <div class="path-marker">${level.id}</div>
        <div class="path-label">
          <strong>${escapeHtml(level.title)}</strong>
          <span>${escapeHtml(stateLabel)}</span>
        </div>
      </article>
    `;
  }).join("");

  refs.pathMap.innerHTML = nodes;
}

function renderMentorCard() {
  const player = currentPlayer();
  const birthdayFact = player.facts[0];
  const goalFact = player.facts[1];
  const initials = player.name
    .split(" ")
    .map((token) => token[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  refs.mentorCard.style.setProperty("--player-accent", player.accentColor);
  refs.mentorCard.innerHTML = `
    <div class="mentor-card-head">
      <div class="mentor-avatar">${escapeHtml(initials)}</div>
      <div>
        <strong>${escapeHtml(player.name)}</strong>
        <span>${escapeHtml(player.role)}</span>
      </div>
    </div>
    <p>${escapeHtml(player.cheer)}</p>
    <div class="mentor-meta">
      <div class="mentor-meta-chip">${escapeHtml(birthdayFact.label)}: ${escapeHtml(birthdayFact.text)}</div>
      <div class="mentor-meta-chip">${escapeHtml(goalFact.label)}: ${escapeHtml(goalFact.text)}</div>
    </div>
  `;
}

function renderSessionChip() {
  if (!gameState.started || gameState.screen === "start") {
    refs.sessionStateChip.textContent = "Warm-up";
    return;
  }

  if (gameState.screen === "reward") {
    refs.sessionStateChip.textContent = "Level Won";
    return;
  }

  if (gameState.screen === "finish") {
    refs.sessionStateChip.textContent = "Cup Lifted";
    return;
  }

  refs.sessionStateChip.textContent = `Level ${gameState.currentLevel + 1}`;
}

function renderActiveScreen() {
  showScreen(gameState.screen);

  if (gameState.screen === "challenge") {
    renderChallengeScreen();
  } else if (gameState.screen === "reward") {
    renderRewardScreen();
  } else if (gameState.screen === "finish") {
    renderFinishScreen();
  }
}

function showScreen(screenName) {
  const map = {
    start: refs.screenStart,
    challenge: refs.screenChallenge,
    reward: refs.screenReward,
    finish: refs.screenFinish,
  };

  Object.entries(map).forEach(([key, element]) => {
    element.classList.toggle("is-active", key === screenName);
  });
}

function renderChallengeScreen() {
  const level = currentLevel();
  const challenge = currentChallenge();
  const result = currentChallengeResult();
  const fact = currentChallengeFact();
  const firstPoints = POINT_RULES[challenge.type].first;
  const retryPoints = POINT_RULES[challenge.type].retry;

  refs.levelTag.textContent = `Level ${level.id}`;
  refs.levelTitle.textContent = level.title;
  refs.levelTheme.textContent = level.theme;
  refs.storyScene.innerHTML = renderStoryScene(level);
  refs.factPanel.innerHTML = renderFactPanel(fact, currentPlayer(), gameState.currentActivityIndex + 1);
  refs.activityProgress.innerHTML = renderActivityProgress();
  refs.challengeTypeLabel.textContent = ACTIVITY_LABELS[ACTIVITY_SEQUENCE[gameState.currentActivityIndex]];
  refs.pointsHint.textContent = `+${firstPoints} first try | +${retryPoints} retry`;
  refs.challengePrompt.textContent = challenge.prompt;
  refs.challengeHint.textContent = challenge.hint;
  refs.visualBoard.innerHTML = renderVisualBoard(challenge.visual);
  refs.choiceGrid.innerHTML = renderChoices(challenge, result);
  refs.feedbackMessage.textContent = gameState.feedbackMessage;
  refs.feedbackMessage.className = `feedback-message${gameState.feedbackTone ? ` ${gameState.feedbackTone}` : ""}`;
  refs.nextActionButton.hidden = !result.resolved;
  refs.nextActionButton.textContent =
    gameState.currentActivityIndex === ACTIVITY_SEQUENCE.length - 1 ? "Finish Level" : "Next Play";
}

function renderStoryScene(level) {
  const player = PLAYER_REFS[level.mentorIndex];

  return `
    <div class="scene-card-header">
      <div>
        <span class="spotlight-label">Match story</span>
        <strong>${escapeHtml(level.title)}</strong>
      </div>
      <span class="mini-chip">${escapeHtml(player.name)}</span>
    </div>
    <p>${escapeHtml(level.storyText)}</p>
    <div class="scene-card-track">
      <div class="soccer-ball"></div>
      <div class="scene-lane">
        <div class="scene-lane-fill"></div>
      </div>
      <span class="mini-chip mini-chip-accent">${escapeHtml(level.rewardLabel)}</span>
    </div>
  `;
}

function renderFactPanel(fact, player, stepNumber) {
  return `
    <div class="fact-panel-head">
      <div>
        <span class="section-tag">Player Fact</span>
        <strong>${escapeHtml(player.name)} spotlight</strong>
      </div>
      <span class="mini-chip mini-chip-accent">Step ${stepNumber}</span>
    </div>
    <p><strong>${escapeHtml(fact.label)}:</strong> ${escapeHtml(fact.text)}</p>
  `;
}

function renderActivityProgress() {
  return ACTIVITY_SEQUENCE.map((activityKey, index) => {
    const activityResult = gameState.levelResults[gameState.currentLevel].activities[activityKey];
    let stateClass = "";

    if (activityResult.resolved) {
      stateClass = "is-done";
    } else if (index === gameState.currentActivityIndex) {
      stateClass = "is-current";
    }

    return `<div class="activity-chip ${stateClass}">${escapeHtml(ACTIVITY_LABELS[activityKey])}</div>`;
  }).join("");
}

function renderChoices(challenge, result) {
  return challenge.options.map((option, index) => {
    const classes = ["choice-button"];

    if (result.resolved && index === challenge.correctIndex) {
      classes.push("is-correct");
    } else if (!result.resolved && result.lastWrongChoice === index) {
      classes.push("is-wrong");
    }

    const disabled = result.resolved ? "disabled" : "";

    return `
      <button
        type="button"
        class="${classes.join(" ")}"
        data-choice-index="${index}"
        ${disabled}
      >
        ${escapeHtml(option)}
      </button>
    `;
  }).join("");
}

function renderVisualBoard(visual) {
  if (visual.kind === "readingCard") {
    return `
      <span class="visual-board-title">${escapeHtml(visual.title)}</span>
      <div class="reading-card">
        <p>${escapeHtml(visual.text)}</p>
      </div>
      <div class="word-chip-row" aria-hidden="true">
        ${visual.chips.map((chip) => `<span class="word-chip">${escapeHtml(chip)}</span>`).join("")}
      </div>
    `;
  }

  if (visual.kind === "numberBoard") {
    return `
      <span class="visual-board-title">${escapeHtml(visual.title)}</span>
      <div class="number-board">
        <div class="equation-row">
          ${visual.tokens
            .map((token, index) => {
              const classes = ["equation-pill"];
              if (index === visual.tokens.length - 1) {
                classes.push("is-answer");
              }

              return `<span class="${classes.join(" ")}">${escapeHtml(token)}</span>`;
            })
            .join("")}
        </div>
        <div class="number-board-note">${escapeHtml(visual.note)}</div>
      </div>
    `;
  }

  if (visual.kind === "groups") {
    return `
      <span class="visual-board-title">${escapeHtml(visual.title)}</span>
      <div class="group-grid">
        ${Array.from({ length: visual.groups }, (_, groupIndex) => {
          return `
            <div class="group-box">
              <strong>${escapeHtml(visual.groupLabel)} ${groupIndex + 1}</strong>
              <div class="mini-ball-row">
                ${Array.from({ length: visual.perGroup }, () => renderMiniItem(visual.item)).join("")}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  if (visual.kind === "sharing") {
    return `
      <span class="visual-board-title">${escapeHtml(visual.title)}</span>
      <div class="sharing-row">
        ${Array.from({ length: visual.groups }, (_, groupIndex) => {
          return `
            <div class="sharing-box">
              <strong>${escapeHtml(visual.groupLabel)} ${groupIndex + 1}</strong>
              <div class="mini-ball-row">
                ${Array.from({ length: Math.floor(visual.total / visual.groups) }, () => renderMiniItem(visual.item)).join("")}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  if (visual.kind === "shapeRow") {
    return `
      <span class="visual-board-title">${escapeHtml(visual.title)}</span>
      <div class="shape-row">
        ${visual.shapes.map((shape) => renderShapeToken(shape)).join("")}
      </div>
    `;
  }

  return "";
}

function renderMiniItem(item) {
  const className = item === "cone" ? "mini-cone" : "mini-ball";
  return `<span class="${className}" aria-hidden="true"></span>`;
}

function renderShapeToken(shape) {
  return `
    <div class="shape-token">
      <span class="shape-${shape}" aria-hidden="true"></span>
      <span class="shape-label">${escapeHtml(capitalize(shape))}</span>
    </div>
  `;
}

function handleChoiceClick(event) {
  const choiceButton = event.target.closest("[data-choice-index]");

  if (!choiceButton || gameState.screen !== "challenge") {
    return;
  }

  const choiceIndex = Number(choiceButton.dataset.choiceIndex);
  const challenge = currentChallenge();
  const result = currentChallengeResult();

  if (result.resolved) {
    return;
  }

  result.attempts += 1;

  if (choiceIndex === challenge.correctIndex) {
    handleCorrectChoice(challenge, result);
    return;
  }

  handleWrongChoice(challenge, result, choiceIndex);
}

function handleCorrectChoice(challenge, result) {
  const firstTry = result.attempts === 1;
  const basePoints = firstTry ? POINT_RULES[challenge.type].first : POINT_RULES[challenge.type].retry;
  let streakBonus = 0;

  if (firstTry) {
    gameState.streakCount += 1;
    streakBonus = Math.min(gameState.streakCount * POINT_RULES.streakStep, POINT_RULES.streakCap);
  } else {
    gameState.streakCount = 0;
  }

  result.resolved = true;
  result.firstTry = firstTry;
  result.awarded = basePoints + streakBonus;
  result.streakBonus = streakBonus;
  result.lastWrongChoice = null;

  const levelResult = gameState.levelResults[gameState.currentLevel];

  if (!firstTry) {
    levelResult.perfect = false;
  }

  levelResult.score += result.awarded;
  gameState.currentScore += result.awarded;
  persistBestScoreIfNeeded();
  animateScoreCard(result.awarded);
  animateElement(refs.challengeCard, ANIMATION_KEYS.correct);
  spawnBurst();

  const streakText = streakBonus ? ` and +${streakBonus} streak bonus` : "";
  gameState.feedbackMessage = `${challenge.successText} +${basePoints} points${streakText}.`;
  gameState.feedbackTone = "is-success";
  renderApp();
}

function handleWrongChoice(challenge, result, choiceIndex) {
  gameState.streakCount = 0;
  gameState.levelResults[gameState.currentLevel].perfect = false;
  result.lastWrongChoice = choiceIndex;
  gameState.feedbackMessage = challenge.retryText;
  gameState.feedbackTone = "is-error";
  animateElement(refs.challengeCard, ANIMATION_KEYS.wrong);
  renderApp();
}

function advanceAfterCorrectAnswer() {
  const result = currentChallengeResult();

  if (!result.resolved) {
    return;
  }

  if (gameState.currentActivityIndex < ACTIVITY_SEQUENCE.length - 1) {
    gameState.currentActivityIndex += 1;
    gameState.feedbackMessage = "Tap the best answer to score points.";
    gameState.feedbackTone = "";
    triggerKickTransition();
    renderApp();
    return;
  }

  completeLevel();
}

function completeLevel() {
  const levelResult = gameState.levelResults[gameState.currentLevel];
  const perfectBonus = levelResult.perfect ? POINT_RULES.perfectLevel : 0;
  const levelBonus = POINT_RULES.levelClear + perfectBonus;
  levelResult.bonus = levelBonus;
  levelResult.score += levelBonus;
  levelResult.completed = true;
  gameState.currentScore += levelBonus;
  persistBestScoreIfNeeded();
  animateScoreCard(levelBonus);

  const stars = calculateStars(levelResult);
  const player = currentPlayer();

  gameState.rewardContext = {
    title: `${currentLevel().title} complete`,
    summary: `You cleared all three plays and earned ${levelResult.score} points in this level.`,
    levelPoints: levelResult.score,
    totalPoints: gameState.currentScore,
    stars,
    cheer: player.cheer,
    fact: currentRewardFact(),
    playerName: player.name,
  };

  if (gameState.currentLevel === LEVELS.length - 1) {
    gameState.screen = "finish";
  } else {
    gameState.screen = "reward";
  }

  gameState.feedbackMessage = "Tap the best answer to score points.";
  gameState.feedbackTone = "";
  triggerKickTransition();
  renderApp();
}

function renderRewardScreen() {
  const context = gameState.rewardContext;
  refs.rewardTitle.textContent = context.title;
  refs.rewardSummary.textContent = context.summary;
  refs.rewardLevelPoints.textContent = String(context.levelPoints);
  refs.rewardTotalPoints.textContent = String(context.totalPoints);
  refs.rewardStars.textContent = context.stars;
  refs.rewardQuote.innerHTML = `
    <strong>${escapeHtml(context.playerName)} celebrates</strong>
    <p>${escapeHtml(context.cheer)}</p>
    <p><strong>${escapeHtml(context.fact.label)}:</strong> ${escapeHtml(context.fact.text)}</p>
  `;
}

function continueToNextLevel() {
  gameState.currentLevel += 1;
  gameState.currentActivityIndex = 0;
  gameState.screen = "challenge";
  gameState.feedbackMessage = "Tap the best answer to score points.";
  gameState.feedbackTone = "";
  triggerKickTransition();
  renderApp();
  refs.playPanel.focus();
}

function renderFinishScreen() {
  const lastContext = gameState.rewardContext;
  refs.finishSummary.textContent =
    `${lastContext.summary} Your final total is ${gameState.currentScore} points.`;
  refs.finishScore.textContent = String(gameState.currentScore);
  refs.finishBestScore.textContent = String(gameState.bestScore);
  refs.finishRank.textContent = calculateRank(gameState.currentScore);
}

function calculateStars(levelResult) {
  const firstTryCount = ACTIVITY_SEQUENCE.filter((key) => levelResult.activities[key].firstTry).length;
  if (firstTryCount === 3) {
    return "★★★";
  }
  if (firstTryCount === 2) {
    return "★★";
  }
  return "★";
}

function calculateRank(score) {
  if (score >= 850) {
    return "Cup Legend";
  }
  if (score >= 650) {
    return "Goal Machine";
  }
  if (score >= 450) {
    return "Playmaker Pro";
  }
  return "Rookie Rocket";
}

function persistBestScoreIfNeeded() {
  if (gameState.currentScore <= gameState.bestScore) {
    return;
  }

  gameState.bestScore = gameState.currentScore;
  saveBestScore(gameState.bestScore);
  animateElement(refs.scoreCardBest, ANIMATION_KEYS.scorePop);
}

function animateScoreCard(delta) {
  refs.scoreCardCurrent.dataset.delta = `+${delta}`;
  animateElement(refs.scoreCardCurrent, ANIMATION_KEYS.scorePop);
}

function spawnBurst() {
  const colors = ["#ffd54b", "#ff944d", "#2ed089", "#54d0ff", "#f07cd4"];
  const centerX = window.innerWidth * 0.55;
  const centerY = window.innerHeight * 0.62;

  Array.from({ length: 12 }, (_, index) => {
    const piece = document.createElement("span");
    const distanceX = (Math.random() * 220 - 110).toFixed(0);
    const distanceY = (Math.random() * 180 - 90).toFixed(0);

    piece.className = "burst-piece";
    piece.style.left = `${centerX}px`;
    piece.style.top = `${centerY}px`;
    piece.style.background = colors[index % colors.length];
    piece.style.setProperty("--tx", `${distanceX}px`);
    piece.style.setProperty("--ty", `${distanceY}px`);
    refs.burstLayer.appendChild(piece);

    window.setTimeout(() => piece.remove(), 760);
  });
}

function triggerKickTransition() {
  animateElement(refs.transitionBall, ANIMATION_KEYS.kick);
}

function animateElement(element, className) {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);

  window.setTimeout(() => {
    element.classList.remove(className);
  }, 820);
}

function currentLevel() {
  return LEVELS[gameState.currentLevel];
}

function currentChallenge() {
  const level = currentLevel();
  return level[ACTIVITY_SEQUENCE[gameState.currentActivityIndex]];
}

function currentChallengeResult() {
  return gameState.levelResults[gameState.currentLevel].activities[ACTIVITY_SEQUENCE[gameState.currentActivityIndex]];
}

function currentPlayer() {
  if (gameState.screen === "finish") {
    return PLAYER_REFS[PLAYER_REFS.length - 1];
  }

  const level = LEVELS[Math.min(gameState.currentLevel, LEVELS.length - 1)];
  return PLAYER_REFS[level.mentorIndex];
}

function currentChallengeFact() {
  const player = currentPlayer();
  return player.facts[Math.min(gameState.currentActivityIndex, player.facts.length - 2)];
}

function currentRewardFact() {
  const player = currentPlayer();
  return player.facts[player.facts.length - 1];
}

function loadBestScore() {
  try {
    return Number(window.localStorage.getItem(STORAGE_KEY)) || 0;
  } catch (error) {
    return 0;
  }
}

function saveBestScore(score) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(score));
  } catch (error) {
    // Ignore storage failures so the game still works offline or in private browsing modes.
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
