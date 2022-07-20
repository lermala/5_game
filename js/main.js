import { draw, loadGame, startGame } from "./game.js";

loadGame();
// клик на кнопку Начать игру
const btnStart = document.getElementById("btnStartGame");
btnStart.addEventListener("click", startGame);



