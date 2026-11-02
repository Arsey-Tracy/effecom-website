export const siteContent = {
  brand: {
    name: "EFFECOM",
    tagline: "Effecting communications",
    statement: "Every voice deserves to be understood.",
  },
  links: {
    home: "/",
    tools: "#tools",
    about: "#about",
    account: "/login",
    privacy: "/privacy",
  },
  navigation: [
    { label: "Home", href: "/" },
    { label: "About", href: "#about" },
    { label: "Sign in", href: "/login" },
  ],
  hero: {
    eyebrow: "EVERY VOICE DESERVES TO BE UNDERSTOOD.",
    title: "Make every message easier to understand.",
    description:
      "EFFECOM helps you turn text into speech, speech into text, translate between supported languages, and make videos more accessible with captions.",
    primaryAction: "Explore the tools",
    secondaryAction: "Why communication matters",
    note:
      "Try translation and text-to-speech as a guest. Create an account to keep a private history of your requests.",
  },
  tools: [
    {
      slug: "text-to-speech",
      title: "Text-to-Speech",
      headline: "Give written words a voice.",
      description:
        "Turn text into spoken audio. Listen to written information instead of reading it.",
      action: "Explore Text-to-Speech",
      icon: "volume",
    },
    {
      slug: "speech-to-text",
      title: "Speech-to-Text",
      headline: "Turn spoken words into text.",
      description:
        "Convert audio recordings into written transcripts that you can review and use.",
      action: "Explore Speech-to-Text",
      icon: "audio",
    },
    {
      slug: "translation",
      title: "Language Translation",
      headline: "Understand beyond language barriers.",
      description:
        "Translate text between supported languages and make it easier to communicate with more people.",
      action: "Explore Translation",
      icon: "languages",
    },
    {
      slug: "video-captions",
      title: "Video Captions",
      headline: "Make video content easier to follow.",
      description:
        "Generate synchronized captions from video speech and review or edit the results.",
      action: "Explore Video Captions",
      icon: "captions",
    },
  ],
} as const;

export type CommunicationTool = (typeof siteContent.tools)[number];
