# [Turn Timer + Coin Flip](https://flip.pana.moe/)

A simple turn timer with a coin flip function, designed to be used on a device placed between the players. Tracks the current time taken by the player on their turn and the total time taken by a player across the current session. 

Tap on the green button or the time display to start the timer for that player. Tapping on the opposing button/time display will switch to tracking that player's time. When the timer is active, the current player's button will change a red pause button enabling that player to pause their timer. Fullscreen button (purple) to the left of the center clock, reset button (orange) to the right of the center clock.

The background glow on the active player's side will change colors after their turn has exceeded 3 minutes.

![](assets/flip_sample_1.png)

![](assets/flip_sample_2.png)

## TODO:
- Confirmation on reset.
- Add display for the history of coin flips during the current session.
- Write to localstorage to survive page refresh.
- Customizable colors, images, turn timeouts/indicators (e.g. elapsed time to change color).
