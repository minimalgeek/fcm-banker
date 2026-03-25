# PRD: Food Chain Magnate Digital Bank Tracker

### 1. Product Objective

To replace the physical paper money and bank tracking in _Food Chain Magnate_ with a streamlined digital interface for 1-5 players. The app must handle rapid transactions (using dedicated `+` and `-` buttons for $1, $5, $10, $50), provide an auditable transaction log, and strictly enforce the game's two-stage bank timer rules—including the crucial "infinite box supply" overflow mechanic.

### 2. Target Platform & UI Layout

- **Device:** Tablet or stretched mobile (Landscape orientation recommended).
- **Usage Context:** "Center-Table Dashboard." The device lays flat in the middle of the table so players or a designated Banker can quickly tap their transactions.
- **Layout Structure:**
  - **Center Top:** **Global Bank Status** (Current Phase, Remaining Bank Balance, Phase Completion Button).
  - **Center Bottom:** **Transaction Log** (Scrolling ticker of recent actions).
  - **Screen Edges:** **Player Zones** (1 to 5). Distributed along the left, right, and bottom edges so players can reach their controls easily.

### 3. Core Features & Requirements

#### F1: Game Initialization & The Reserve

The app must manage the initial setup and the hidden reserve mechanic without players accidentally seeing each other's choices.

- **Player Setup:** Select 1 to 5 players. Assign colors and names.
- **Initial Bank Generation:** Automatically calculate and set the Stage 1 bank to exactly `$50 × Player Count`.
- **Hidden Reserve Selection:** A "pass-and-play" prompt where each player secretly taps their Reserve card choice ($100, $200, or $300). The app stores these values in the background and keeps them completely hidden until Stage 1 ends.

#### F2: The Transaction Engine (Income & Expenses)

Players need to quickly add money (Dinner Time) or pay money back (Payday) with zero friction.

| Requirement                      | Description                                                                                                                                                                                                                                                                                                                                                       |
| :------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Direct +/- Buttons**           | Each Player Zone features 8 dedicated buttons: **+1, -1, +5, -5, +10, -10, +50, -50**. This allows instant logging of income or expenses without needing to toggle states.                                                                                                                                                                                        |
| **3-Second Debounce (Batching)** | Transactions of the same type for a player are batched together until a 3-second inactivity cooldown (debounce) passes. _Example:_ Tapping +10 three times within 3 seconds results in a single "+$30" entry in the log once the timer expires.                                                                                                                   |
| **Pending Amount Preview**       | During the 3-second cooldown, the Player Zone header displays the accumulated pending amount in a muted/greyed-out style (e.g., "+$30 pending"). This gives instant visual feedback that taps are being registered and shows the total that will be committed once the cooldown expires. The pending indicator disappears once the batch is committed to the log. |
| **Undo Button**                  | A global "Undo Last Action" button to quickly reverse accidental taps or fat-finger mistakes.                                                                                                                                                                                                                                                                     |

#### F3: Bank Break & Overflow Logic (The Timer)

The system must correctly manage the Stage 1 and Stage 2 banks, ensuring overflow comes from the "infinite game box" and does not penalize the newly created Stage 2 bank.

- **Triggering the First Break:** When a player's `+` transaction drops the Stage 1 bank to $0 or below:
  - The app displays a persistent "Bank Broke!" indicator.
  - The player continues to receive their full payout in their personal total. Any amount drawn past the bank's $0 mark is tracked internally as "Box Money" (infinite supply).
  - Other players continue their Dinner Time payouts as normal, pulling directly from the infinite Box Money.
- **Phase Completion:** A global "End Phase" button is pressed manually by the players once Dinner Time (or the milestone payout phase) is completely finished.
- **Stage 2 Creation:** Triggering "End Phase" while the bank is broken reveals all players' secret reserve choices on screen. The app tallies the total of the revealed reserves and sets the Bank Balance to exactly that number, creating a pristine Stage 2 bank. (Previous "Box Money" overflow is wiped/ignored).
- **Game End Trigger:** If the Stage 2 bank hits $0, the app signals the Final Round. Players finish the current phase (drawing overflow Box Money as needed), and the app locks into a "Game Over / Final Scores" screen.

#### F4: Transaction Logging

A transparent history is required so players can audit past turns and ensure no salaries or payouts were skipped.

- **Chronological Feed:** Display a scrolling list of all batched actions in the center of the screen.
- **Log Format:** `[Turn/Phase] - [Player Name] - [Action Type] - [Amount]`
  - _Example:_ `Dinner Time - Player Red: +$40`
  - _Example:_ `Payday - Player Blue: -$15`
- **Open Information:** All players' current personal cash totals must be openly displayed prominently in their Player Zone at all times.

### 4. Edge Cases & Constraints

- **Preventing Negative Player Cash:** The system must prevent a player from logging a `-` transaction that exceeds their current personal cash total. If they must fire employees, they simply don't pay the expense.
- **Accidental Phase Advancement:** Require a long-press or a confirmation modal on the "End Phase" button to prevent accidentally triggering the reserve reveal.

### 5. User Stories

**Setup & Initialization**

- **As a player**, I want to secretly select my reserve card ($100, $200, or $300) during setup so that my endgame strategy remains hidden from my opponents.
- **As a user**, I want the initial Stage 1 bank to automatically calculate based on the selected player count ($50 x players) so that we can start playing immediately without manual math.

**Transactions & Logging**

- **As a player**, I want to use dedicated `+` and `-` buttons for standard denominations ($1, $5, $10, $50) so I can instantly log my income and expenses without navigating menus.
- **As a player**, I want my rapid, consecutive taps (e.g., tapping `+10` three times) to be batched into a single total after a 3-second cooldown so that the transaction log remains clean and easy to read.
- **As a player**, I want to see the accumulated pending amount (greyed out) in my Player Zone header during the cooldown so I know my taps are being registered and can see the total before it commits.
- **As a player**, I want an "Undo" button so I can instantly correct a mistake if I accidentally tap the wrong denomination.
- **As a player**, I want to see a chronological log of all transactions so that the table can verify if someone forgot to take their income or pay their salaries.

**Bank Rules & Mechanics**

- **As a player**, I want the system to automatically handle the first bank break and provide "overflow" box money so I receive my full payout without penalizing the upcoming Stage 2 bank.
- **As a player**, I want a confirmation step before ending a phase so that we don't accidentally reveal the hidden reserve cards prematurely.
- **As a player**, I want the app to automatically reveal the reserves and calculate the exact Stage 2 bank total once the phase is ended, removing manual math errors.
- **As a player**, I want the app to clearly notify the table when the Stage 2 bank breaks so we know we are in the final round of the game.
- **As a player**, I want the system to prevent me from logging an expense that drops my personal cash below $0, reflecting the rule that you cannot pay money you do not have.
