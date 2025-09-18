
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
}

const CANVAS_HEIGHT = 600;
const CANVAS_WIDTH = 800;

module.exports = {
    MIN_INTERVAL,
    TEN_MINUTES,
    MAX_IMAGE_SIZE,
    NAME_REGEX,
    GameState,
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
}