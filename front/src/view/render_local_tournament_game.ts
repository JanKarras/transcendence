import { bodyContainer } from "../constants/constants.js";
import { render_header } from "./render_header.js";


export async function render_local_tournament_game(params: URLSearchParams | null) {
  if (!bodyContainer) return;

  const gameId = params?.get("gameId");

  
  render_header();
}

