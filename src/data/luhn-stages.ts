export const LUHN_STAGES = [
  {
    title: "Start with the number",
    short: "Read it",
    body: "Take the digits exactly as printed. The very last digit is the check digit. It was chosen by the issuer so that the whole number works out, and everything else in the number is what it gets checked against.",
  },
  {
    title: "Pick every second digit from the right",
    short: "Pick",
    body: "Start at the check digit and count leftwards. The check digit itself stays as it is, the next one is picked, then skip one, pick one, and so on. The picked digits are lifted and outlined.",
  },
  {
    title: "Double the picked digits",
    short: "Double",
    body: "Multiply each picked digit by 2. Digits that were not picked are left alone.",
  },
  {
    title: "Fold anything above 9 back down",
    short: "Fold",
    body: "If doubling gave a two digit number, subtract 9. That is the same as adding its two digits together (16 becomes 1 + 6 = 7), and it keeps every value to a single digit.",
  },
  {
    title: "Add everything up",
    short: "Add",
    body: "Sum all the values, picked and not picked. Each bar is one digit's value.",
  },
  {
    title: "Is the total a multiple of 10?",
    short: "Check",
    body: "Divide the total by 10. If nothing is left over, the number passes and the ring closes. Any remainder at all means something is off, most often a mistyped digit.",
  },
] as const;
