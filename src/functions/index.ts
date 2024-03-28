
// export functions here
export function generateUUID() {
  let uuid = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 8; i++) {
    uuid += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return uuid;
}

export function isEmoji(input: string): any {
  const emojiRegex = /[\u{1F600}-\u{1F64F}]/gu;
  const formatRegex = /<:[a-zA-Z_]+:[0-9]+>/g;
  if (emojiRegex.test(input) || formatRegex.test(input)) {
    return input;
  } else {
    throw new Error("Emoji Inválido");
  }
}


