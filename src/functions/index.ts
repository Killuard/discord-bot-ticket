import { EmojiKey, Emojilist } from "#interfaces";
import { settings } from "#settings";
import { formatEmoji } from "discord.js";

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

export function icon(name: EmojiKey) {
  const animated = name.startsWith(":a:");

  const id = animated
    ? settings.emojis.animated[name.slice(3, name.length) as keyof Emojilist["animated"]]
    : settings.emojis.static[name as keyof Emojilist["static"]];

  const toString = () => formatEmoji(id, animated);

  return { id, animated, toString };
}

