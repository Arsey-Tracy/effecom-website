export const siteContent = {
  brand: {
    name: "Effecom",
    parent: "Nexus Care",
    attribution: "A Nexus Care initiative",
    contactEmail: null,
  },
  links: {
    home: "/",
    pilot: "#pilot",
    privacy: "/privacy",
    approach: "#approach",
    features: "#features",
    howItWorks: "#how-it-works",
    accessibility: "#accessibility",
    faqs: "#faqs",
  },
  navigation: [
    { label: "Our approach", href: "#approach" },
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Accessibility", href: "#accessibility" },
    { label: "FAQs", href: "#faqs" },
  ],
  hero: {
    eyebrow: "Accessible healthcare communication · Uganda",
    title: "Healthcare should be understood by everyone.",
    description:
      "Effecom is building more accessible ways for deaf and hard-of-hearing people in Uganda to communicate in healthcare settings—with Uganda Sign Language, visual communication, and inclusive experiences at the heart of the journey.",
    primaryAction: "Join the Pilot",
    secondaryAction: "Explore our approach",
    note: "Help shape a more accessible healthcare experience. Register your interest in the Effecom pilot.",
  },
  features: [
    {
      title: "Uganda Sign Language support",
      description:
        "We are exploring ways to make healthcare communication more accessible for people who use Uganda Sign Language, with visual resources and tools guided by what can be responsibly supported.",
      status: "Planned",
      icon: "hands" as const,
    },
    {
      title: "Text and visual communication",
      description:
        "Written communication, captions, and clearer visual presentation can offer meaningful options. Their availability will depend on the features developed and supported.",
      status: "Planned",
      icon: "message" as const,
    },
    {
      title: "Visual notifications",
      description:
        "Clear on-screen updates and feedback are part of the intended experience, so important cues do not rely only on sound.",
      status: "Planned",
      icon: "bell" as const,
    },
  ],
  pilotSteps: [
    {
      title: "Tell us what matters",
      description:
        "Explore the communication approaches Effecom is considering and the needs the pilot aims to understand.",
    },
    {
      title: "Register your interest",
      description:
        "Share a preferred contact method and, if you wish, your communication preferences and general location.",
    },
    {
      title: "Hear from the team",
      description:
        "When pilot participation is ready and registration is connected, the team can share relevant next steps.",
    },
  ],
  faqs: [
    {
      question: "What is Effecom?",
      answer:
        "Effecom is a Uganda-focused initiative developing more accessible ways for deaf and hard-of-hearing people to communicate in healthcare settings. It is being shaped around different communication preferences and community input.",
    },
    {
      question: "Who is Effecom being designed for?",
      answer:
        "Effecom is being designed with deaf and hard-of-hearing people in Uganda in mind. People communicate in different ways, so the intended experience includes options such as Uganda Sign Language, written communication, captions, and other visual approaches where supported.",
    },
    {
      question: "Why is Uganda Sign Language a priority?",
      answer:
        "Effecom is focused on Uganda, so Uganda Sign Language belongs in its local context. It is one important communication preference, not an assumption about how every deaf or hard-of-hearing person communicates.",
    },
    {
      question: "Is Effecom already available?",
      answer:
        "Effecom is in development. The features described here are planned directions, not a promise that a service or specific capability is currently available.",
    },
    {
      question: "How can I participate in the pilot?",
      answer:
        "You can use the interest form on this page. If registration has not been connected, your details are not sent. Even when connected, registering does not guarantee pilot participation.",
    },
    {
      question: "Do I need to use Uganda Sign Language to be involved?",
      answer:
        "No. People have different communication preferences. You can share a preference if you wish, or leave that field blank. You do not need to explain or disclose personal health information.",
    },
    {
      question: "What happens to the information I submit?",
      answer:
        "The form asks only for details needed to respond to interest. Your details are sent only when a registration endpoint has been configured; otherwise, they are not submitted. Read the draft privacy notice for more information.",
    },
    {
      question: "Does registering for early access mean I receive medical care?",
      answer:
        "No. Effecom is a developing communication-accessibility initiative, not a medical service. Registering interest does not provide medical care, guarantee an invitation, or confirm pilot acceptance.",
    },
  ],
} as const;

export type FeatureStatus = "Available" | "In development" | "Planned";
