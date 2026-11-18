// Everything the terminal says about Faris. Edit this file to change the about
// text or to add a project: a new entry appears in projects/ automatically.

export type Project = { file: string; title: string; about: string; url: string };

export const ABOUT = {
  name: "Faris Siddiqi",
  summary: "New grad Software Engineer at RRD, working with C#/.NET and SQL.",
};

export const RESUME = {
  path: "/Resume.pdf",
  filename: "Faris Siddiqi Resume.pdf",
} as const;

const GITHUB = "https://github.com/fsiddiqi03";

export const PROJECTS: Project[] = [
  {
    file: "discord-aws-bot.txt",
    title: "Discord AWS Bot",
    about:
      "Discord bot that runs a modded Minecraft server on AWS EC2. Slash commands start and stop the server, check its status, and back up the world to S3.",
    url: `${GITHUB}/DiscordAWS`,
  },
  {
    file: "custom-pi-ring-camera.txt",
    title: "Custom Pi Ring Camera",
    about:
      "Smart security camera built on a Raspberry Pi 5. A YOLO model on AWS Lambda detects people, recordings are stored in S3, and SES sends email alerts.",
    url: `${GITHUB}/Custom-Pi-Ring-Camera`,
  },
  {
    file: "pi-flood-detector.txt",
    title: "Pi Flood Detector",
    about:
      "Home flood detector using a Raspberry Pi and a water level sensor. When it detects water, it sends an email alert through AWS SES.",
    url: `${GITHUB}/RaspberryPi-Flood-Detector`,
  },
  {
    file: "chicago-pothole-web.txt",
    title: "Chicago Pothole Web",
    about:
      "Web app that tracks open potholes across Chicago every day. Built with Next.js, with a Mapbox map and a ward leaderboard.",
    url: `${GITHUB}/Chicago-Pothole-Web`,
  },
  {
    file: "steam-flock-bot.txt",
    title: "Steam Flock Bot",
    about:
      "Discord bot that watches your Steam friends and posts when they start, switch, or stop a game. Player and session data is stored in Supabase.",
    url: `${GITHUB}/Steam-Friend-Tracker-Discord-Bot`,
  },
  {
    file: "financial-distress-predictor.txt",
    title: "Financial Distress Predictor",
    about:
      "Machine learning project that predicts whether a borrower will face financial distress within two years. Trains and compares four models on Kaggle's Give Me Some Credit dataset.",
    url: `${GITHUB}/Finacial-Distress-Predictor`,
  },
];
