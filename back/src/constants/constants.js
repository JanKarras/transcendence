
const MIN_INTERVAL = 60 * 1000;
const TEN_MINUTES = 10 * 60 * 1000;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const NAME_REGEX = /^[a-zA-ZäöüÄÖÜß0-9 .'-]{1,50}$/;

const GameState = {
    NOT_STARTED: "NOT_STARTED",
    BOTH_CONNECTED: "BOTH_CONNECTED",
    STARTED: "STARTED",
    FINISHED: "FINISHED",
    ERROR: "ERROR",
    GAMEOVER: "GAMEOVER",
}

const MatchType = {
    LOCAL_1V1: "1v1_local",
    REMOTE_1V1: "1v1_remote",
    TOURNAMENT: "tournament",
}

const CANVAS_HEIGHT = 600;
const CANVAS_WIDTH = 800;
const PADDLE_HEIGHT = 50;
const PADDLE_WIDTH = 10;
const PADDLE_SPEED = 5;

module.exports = {
    MIN_INTERVAL,
    TEN_MINUTES,
    MAX_IMAGE_SIZE,
    NAME_REGEX,
    GameState,
    MatchType,
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    PADDLE_HEIGHT,
    PADDLE_WIDTH,
    PADDLE_SPEED,
}