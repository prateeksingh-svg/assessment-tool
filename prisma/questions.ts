// prisma/questions.ts - All 55 assessment questions

export type Question = {
  id: string;
  section: "intent" | "english" | "sales" | "personality" | "aptitude";
  sectionLabel: string;
  text: string;
  options: string[];
  correctAnswer?: number; // for scoring (0-indexed), intent questions use weights
  weights?: number[]; // for intent section: points per option (0,1,2,3)
};

export const QUESTIONS: Question[] = [
  // ─── SECTION 1: INTENT (7 questions) ───────────────────────────────────────
  {
    id: "INT_01",
    section: "intent",
    sectionLabel: "Section 1 — Mandatory Questions",
    text: "You are given a sales target that seems almost impossible to achieve in the given timeframe. What would you do?",
    options: [
      "Ask the manager to reduce the target",
      "Work the same way and see what happens",
      "Break it into smaller daily goals and push hard every day",
      "Look for a different role with realistic targets"
    ],
    weights: [0, 1, 3, 0]
  },
  {
    id: "INT_02",
    section: "intent",
    sectionLabel: "Section 1 — Mandatory Questions",
    text: "A potential customer has rejected your pitch three times. What is your next step?",
    options: [
      "Move on to the next lead",
      "Give it one more try with the same pitch",
      "Analyse what went wrong and rework the approach before trying again",
      "Ask a senior colleague to take over"
    ],
    weights: [0, 1, 3, 1]
  },
  {
    id: "INT_03",
    section: "intent",
    sectionLabel: "Section 1 — Mandatory Questions",
    text: "How do you feel about making 50+ cold calls in a single day?",
    options: [
      "It feels exhausting and demotivating",
      "I can do it occasionally but not consistently",
      "I see it as a numbers game and stay energised throughout",
      "I would prefer to focus only on warm leads"
    ],
    weights: [0, 1, 3, 1]
  },
  {
    id: "INT_04",
    section: "intent",
    sectionLabel: "Section 1 — Mandatory Questions",
    text: "You miss your monthly sales target for the first time. How do you respond?",
    options: [
      "Feel discouraged and wonder if sales is right for you",
      "Wait for the manager to guide you",
      "Review your pipeline, identify gaps, and immediately build a recovery plan",
      "Blame external factors like market conditions"
    ],
    weights: [0, 1, 3, 0]
  },
  {
    id: "INT_05",
    section: "intent",
    sectionLabel: "Section 1 — Mandatory Questions",
    text: "What motivates you most in a sales role?",
    options: [
      "Fixed salary and job security",
      "Flexible working hours",
      "Unlimited earning potential tied to performance",
      "Recognition from peers"
    ],
    weights: [1, 1, 3, 2]
  },
  {
    id: "INT_06",
    section: "intent",
    sectionLabel: "Section 1 — Mandatory Questions",
    text: "A customer becomes rude during a sales conversation. What do you do?",
    options: [
      "End the call politely and report it",
      "Match their tone to assert yourself",
      "Stay calm, acknowledge their frustration, and redirect the conversation professionally",
      "Hand it off to customer support immediately"
    ],
    weights: [1, 0, 3, 1]
  },
  {
    id: "INT_07",
    section: "intent",
    sectionLabel: "Section 1 — Mandatory Questions",
    text: "How important is it for you to be in the top performer list every month?",
    options: [
      "Not very important — I just want to do my job",
      "Somewhat important — nice to have",
      "Very important — I set personal benchmarks and compete with myself",
      "Important only if there are incentives"
    ],
    weights: [0, 1, 3, 2]
  },

  // ─── SECTION 2: ENGLISH COMMUNICATION (12 questions) ──────────────────────
  {
    id: "ENG_01",
    section: "english",
    sectionLabel: "English Communication",
    text: "Choose the correctly punctuated sentence:",
    options: [
      "The client said, he would call back tomorrow.",
      "The client said he would call back, tomorrow.",
      "The client said he would call back tomorrow.",
      "The client said; he would call back tomorrow."
    ],
    correctAnswer: 2
  },
  {
    id: "ENG_02",
    section: "english",
    sectionLabel: "English Communication",
    text: "Which sentence uses the most professional tone for a sales email?",
    options: [
      "Hey! Just checking if you got my last message.",
      "I wanted to follow up on my previous email regarding our proposal.",
      "Did you even read what I sent?",
      "You should really consider our offer, it's great."
    ],
    correctAnswer: 1
  },
  {
    id: "ENG_03",
    section: "english",
    sectionLabel: "English Communication",
    text: "Identify the grammatically correct sentence:",
    options: [
      "Our team have completed the report on time.",
      "Our team has completed the report on time.",
      "Our team have been complete the report on time.",
      "Our team completing the report on time."
    ],
    correctAnswer: 1
  },
  {
    id: "ENG_04",
    section: "english",
    sectionLabel: "English Communication",
    text: "Which word best fills the blank? 'The manager asked us to ______ the presentation before the client meeting.'",
    options: ["revise", "revised", "revising", "revision"],
    correctAnswer: 0
  },
  {
    id: "ENG_05",
    section: "english",
    sectionLabel: "English Communication",
    text: "What does 'ROI' stand for in a business context?",
    options: [
      "Rate of Interest",
      "Return on Investment",
      "Revenue over Income",
      "Risk of Inflation"
    ],
    correctAnswer: 1
  },
  {
    id: "ENG_06",
    section: "english",
    sectionLabel: "English Communication",
    text: "Choose the correct word: 'We need to ______ our strategy to meet the new targets.'",
    options: ["adapt", "adopt", "adept", "adhere"],
    correctAnswer: 0
  },
  {
    id: "ENG_07",
    section: "english",
    sectionLabel: "English Communication",
    text: "Which sentence is written in active voice?",
    options: [
      "The proposal was submitted by the team.",
      "The meeting was attended by all managers.",
      "The team submitted the proposal on Friday.",
      "The report was completed by the analyst."
    ],
    correctAnswer: 2
  },
  {
    id: "ENG_08",
    section: "english",
    sectionLabel: "English Communication",
    text: "Choose the correctly spelled word:",
    options: ["accomodation", "acommodation", "accommodation", "accomodattion"],
    correctAnswer: 2
  },
  {
    id: "ENG_09",
    section: "english",
    sectionLabel: "English Communication",
    text: "What is the best way to begin a cold email to a potential client?",
    options: [
      "I am writing to tell you about our amazing product.",
      "You have to try our service immediately.",
      "I hope this message finds you well. I wanted to introduce a solution that may benefit your team.",
      "Buy now and get 50% off!"
    ],
    correctAnswer: 2
  },
  {
    id: "ENG_10",
    section: "english",
    sectionLabel: "English Communication",
    text: "Which of the following is an example of an idiom?",
    options: [
      "The sky is blue.",
      "She ran very fast.",
      "He hit the nail on the head.",
      "The report was detailed."
    ],
    correctAnswer: 2
  },
  {
    id: "ENG_11",
    section: "english",
    sectionLabel: "English Communication",
    text: "What does 'to table a discussion' mean in a formal meeting context?",
    options: [
      "To start a discussion",
      "To postpone a discussion to a later time",
      "To write down the discussion points",
      "To end the discussion permanently"
    ],
    correctAnswer: 1
  },
  {
    id: "ENG_12",
    section: "english",
    sectionLabel: "English Communication",
    text: "Select the most concise and professional way to say: 'Due to the fact that the client did not respond, we decided to send a follow-up.'",
    options: [
      "Because the client didn't reply, we followed up.",
      "Since the client failed to respond, a follow-up was deemed necessary by us.",
      "We sent a follow-up since the client had not responded.",
      "We followed up on account of the non-response from the client."
    ],
    correctAnswer: 2
  },

  // ─── SECTION 3: SALES JUDGEMENT (12 questions) ────────────────────────────
  {
    id: "SAL_01",
    section: "sales",
    sectionLabel: "Sales Judgement",
    text: "A prospect says 'Your price is too high.' The best response is:",
    options: [
      "We can give you a discount immediately.",
      "Let me understand your budget and explain the value our solution provides.",
      "Sorry, that's the best we can do.",
      "Maybe our product is not for you then."
    ],
    correctAnswer: 1
  },
  {
    id: "SAL_02",
    section: "sales",
    sectionLabel: "Sales Judgement",
    text: "What is the primary purpose of a discovery call?",
    options: [
      "To present your full product demo",
      "To understand the prospect's needs, pain points and budget",
      "To negotiate pricing",
      "To close the deal"
    ],
    correctAnswer: 1
  },
  {
    id: "SAL_03",
    section: "sales",
    sectionLabel: "Sales Judgement",
    text: "Which of the following is a buying signal from a prospect?",
    options: [
      "We already have a solution for this.",
      "Can you send me the pricing details and onboarding timeline?",
      "We are not interested at this time.",
      "We will think about it."
    ],
    correctAnswer: 1
  },
  {
    id: "SAL_04",
    section: "sales",
    sectionLabel: "Sales Judgement",
    text: "A customer says 'I need to discuss this with my team.' What should you do?",
    options: [
      "Ask them to make a decision on the spot.",
      "Thank them and wait for them to call back.",
      "Offer to schedule a meeting to present to the team and address concerns together.",
      "Tell them the offer expires today."
    ],
    correctAnswer: 2
  },
  {
    id: "SAL_05",
    section: "sales",
    sectionLabel: "Sales Judgement",
    text: "What does SPIN in SPIN Selling stand for?",
    options: [
      "Sales, Pitch, Interest, Negotiation",
      "Situation, Problem, Implication, Need-payoff",
      "Strategy, Planning, Influence, Numbers",
      "Selling, Persuasion, Insight, Nurturing"
    ],
    correctAnswer: 1
  },
  {
    id: "SAL_06",
    section: "sales",
    sectionLabel: "Sales Judgement",
    text: "Which approach is best for upselling an existing customer?",
    options: [
      "Push the most expensive product immediately.",
      "Understand their current usage and suggest upgrades that directly address their evolving needs.",
      "Wait for them to ask for an upgrade.",
      "Offer random discounts to keep them engaged."
    ],
    correctAnswer: 1
  },
  {
    id: "SAL_07",
    section: "sales",
    sectionLabel: "Sales Judgement",
    text: "What is the most effective way to handle a competitor comparison during a sales call?",
    options: [
      "Criticise the competitor aggressively.",
      "Deny knowing the competitor.",
      "Acknowledge the competitor and clearly articulate your unique differentiators.",
      "Ask the customer to ignore the competitor."
    ],
    correctAnswer: 2
  },
  {
    id: "SAL_08",
    section: "sales",
    sectionLabel: "Sales Judgement",
    text: "What does a healthy sales pipeline indicate?",
    options: [
      "Many deals in the negotiation stage only",
      "Deals distributed across all stages with consistent new entries",
      "A large number of closed-lost deals",
      "Only high-value deals being pursued"
    ],
    correctAnswer: 1
  },
  {
    id: "SAL_09",
    section: "sales",
    sectionLabel: "Sales Judgement",
    text: "A lead goes cold after showing initial interest. What is the best re-engagement strategy?",
    options: [
      "Send aggressive discount offers.",
      "Reach out with new relevant insights or changes that relate to their original interest.",
      "Mark them as lost and move on.",
      "Call them every day until they respond."
    ],
    correctAnswer: 1
  },
  {
    id: "SAL_10",
    section: "sales",
    sectionLabel: "Sales Judgement",
    text: "What does 'consultative selling' mean?",
    options: [
      "Selling products by consulting a price list",
      "Acting as an advisor to understand and solve the customer's actual business problem",
      "Consulting multiple customers at the same time",
      "Selling via consultants only"
    ],
    correctAnswer: 1
  },
  {
    id: "SAL_11",
    section: "sales",
    sectionLabel: "Sales Judgement",
    text: "Which metric best indicates the effectiveness of a salesperson's closing ability?",
    options: [
      "Number of calls made",
      "Number of proposals sent",
      "Win rate (deals closed / deals entered pipeline)",
      "Number of LinkedIn connections"
    ],
    correctAnswer: 2
  },
  {
    id: "SAL_12",
    section: "sales",
    sectionLabel: "Sales Judgement",
    text: "During a negotiation, the prospect asks for a feature not in your product. You should:",
    options: [
      "Promise to build it immediately.",
      "Lie and say it's already available.",
      "Be honest about the current roadmap and highlight existing features that partially address the need.",
      "Ignore the request and continue pitching."
    ],
    correctAnswer: 2
  },

  // ─── SECTION 4: PERSONALITY & RESILIENCE (12 questions) ───────────────────
  {
    id: "PER_01",
    section: "personality",
    sectionLabel: "Personality & Resilience",
    text: "When faced with a challenging task at work, you typically:",
    options: [
      "Avoid it until absolutely necessary",
      "Ask someone else to handle it",
      "Break it into steps and tackle it systematically",
      "Do only the minimum required"
    ],
    correctAnswer: 2
  },
  {
    id: "PER_02",
    section: "personality",
    sectionLabel: "Personality & Resilience",
    text: "How do you typically respond to negative feedback from a manager?",
    options: [
      "Feel hurt and defensive",
      "Ignore it and continue as before",
      "Listen carefully, reflect on it, and implement improvements",
      "Agree in the moment but change nothing"
    ],
    correctAnswer: 2
  },
  {
    id: "PER_03",
    section: "personality",
    sectionLabel: "Personality & Resilience",
    text: "Your team misses an important deadline. As a team member, you:",
    options: [
      "Blame the team leader",
      "Pretend it did not happen",
      "Own your part of the responsibility and help create a recovery plan",
      "Wait for instructions from above"
    ],
    correctAnswer: 2
  },
  {
    id: "PER_04",
    section: "personality",
    sectionLabel: "Personality & Resilience",
    text: "You disagree with a decision made by your manager. What do you do?",
    options: [
      "Complain to colleagues",
      "Refuse to follow the decision",
      "Respectfully voice your concerns through the right channel and then support the final decision",
      "Say nothing and silently resist"
    ],
    correctAnswer: 2
  },
  {
    id: "PER_05",
    section: "personality",
    sectionLabel: "Personality & Resilience",
    text: "How do you deal with repetitive tasks that are part of your role?",
    options: [
      "Find ways to avoid them",
      "Do them reluctantly with minimal effort",
      "Look for ways to optimise them while maintaining quality",
      "Constantly complain about them to the team"
    ],
    correctAnswer: 2
  },
  {
    id: "PER_06",
    section: "personality",
    sectionLabel: "Personality & Resilience",
    text: "You have back-to-back rejections for two full weeks. How do you respond?",
    options: [
      "Consider quitting the job",
      "Stop making calls for a few days",
      "Analyse what might be causing the pattern and try a different approach",
      "Accept failure and lower your target expectations"
    ],
    correctAnswer: 2
  },
  {
    id: "PER_07",
    section: "personality",
    sectionLabel: "Personality & Resilience",
    text: "How comfortable are you working in an environment with high ambiguity and frequent changes?",
    options: [
      "Very uncomfortable — I need clear structure",
      "Somewhat uncomfortable but I manage",
      "Comfortable — I adapt quickly and see it as an opportunity",
      "Indifferent — it does not affect me much"
    ],
    correctAnswer: 2
  },
  {
    id: "PER_08",
    section: "personality",
    sectionLabel: "Personality & Resilience",
    text: "When you make a mistake that impacts the team, you:",
    options: [
      "Hide it and hope no one notices",
      "Blame the circumstances",
      "Acknowledge it immediately, apologise, and work on fixing it",
      "Downplay its significance"
    ],
    correctAnswer: 2
  },
  {
    id: "PER_09",
    section: "personality",
    sectionLabel: "Personality & Resilience",
    text: "How do you manage your energy and motivation during a slow sales period?",
    options: [
      "Wait for the market to pick up",
      "Reduce your activity levels accordingly",
      "Use the time to upskill, prospect harder, and strengthen your pipeline",
      "Hope your manager gives you easier targets"
    ],
    correctAnswer: 2
  },
  {
    id: "PER_10",
    section: "personality",
    sectionLabel: "Personality & Resilience",
    text: "Which best describes your approach to self-improvement?",
    options: [
      "I improve only when required by my manager",
      "I wait for formal training programmes",
      "I proactively seek feedback and resources to grow independently",
      "I believe my current skills are sufficient"
    ],
    correctAnswer: 2
  },
  {
    id: "PER_11",
    section: "personality",
    sectionLabel: "Personality & Resilience",
    text: "You are assigned to a new territory with no existing relationships. You feel:",
    options: [
      "Anxious and unsure where to start",
      "Frustrated — it seems unfair",
      "Excited about the opportunity to build from scratch",
      "Neutral — it is just work"
    ],
    correctAnswer: 2
  },
  {
    id: "PER_12",
    section: "personality",
    sectionLabel: "Personality & Resilience",
    text: "Which statement best reflects how you handle pressure?",
    options: [
      "Pressure causes me to underperform",
      "I avoid situations where I might feel pressured",
      "I channel pressure into focus and increased effort",
      "Pressure does not affect me either way"
    ],
    correctAnswer: 2
  },

  // ─── SECTION 5: APTITUDE (12 questions) ───────────────────────────────────
  {
    id: "APT_01",
    section: "aptitude",
    sectionLabel: "Aptitude",
    text: "If a salesperson earns a 5% commission on every sale and closes deals worth ₹4,00,000 in a month, what is their commission?",
    options: ["₹10,000", "₹20,000", "₹15,000", "₹25,000"],
    correctAnswer: 1
  },
  {
    id: "APT_02",
    section: "aptitude",
    sectionLabel: "Aptitude",
    text: "A product costs ₹1,200 and is sold at a 25% markup. What is the selling price?",
    options: ["₹1,400", "₹1,450", "₹1,500", "₹1,550"],
    correctAnswer: 2
  },
  {
    id: "APT_03",
    section: "aptitude",
    sectionLabel: "Aptitude",
    text: "A salesperson made 80 calls in a week and converted 12. What is the conversion rate?",
    options: ["12%", "14%", "15%", "18%"],
    correctAnswer: 2
  },
  {
    id: "APT_04",
    section: "aptitude",
    sectionLabel: "Aptitude",
    text: "If a target is ₹5,00,000 and 60% is achieved, how much is still remaining?",
    options: ["₹1,50,000", "₹2,00,000", "₹2,50,000", "₹3,00,000"],
    correctAnswer: 1
  },
  {
    id: "APT_05",
    section: "aptitude",
    sectionLabel: "Aptitude",
    text: "A deal of ₹80,000 is offered a 10% discount. What is the final price?",
    options: ["₹70,000", "₹72,000", "₹74,000", "₹75,000"],
    correctAnswer: 1
  },
  {
    id: "APT_06",
    section: "aptitude",
    sectionLabel: "Aptitude",
    text: "A team of 5 salespeople collectively closes ₹15,00,000 in a month. What is the average per person?",
    options: ["₹2,50,000", "₹3,00,000", "₹3,50,000", "₹4,00,000"],
    correctAnswer: 1
  },
  {
    id: "APT_07",
    section: "aptitude",
    sectionLabel: "Aptitude",
    text: "If a salesperson's monthly target increases by 20% from ₹2,50,000, what is the new target?",
    options: ["₹2,80,000", "₹3,00,000", "₹3,10,000", "₹3,20,000"],
    correctAnswer: 1
  },
  {
    id: "APT_08",
    section: "aptitude",
    sectionLabel: "Aptitude",
    text: "Look at the pattern: 2, 6, 18, 54, ___. What comes next?",
    options: ["108", "112", "162", "216"],
    correctAnswer: 2
  },
  {
    id: "APT_09",
    section: "aptitude",
    sectionLabel: "Aptitude",
    text: "A proposal was sent on Monday. The client needs 5 business days to respond. On which day will you follow up?",
    options: ["Friday", "Saturday", "Monday", "Tuesday"],
    correctAnswer: 2
  },
  {
    id: "APT_10",
    section: "aptitude",
    sectionLabel: "Aptitude",
    text: "A salesperson has 3 meetings per day for 5 days and each meeting has a 30% close rate. How many deals are expected to close?",
    options: ["3", "4", "4.5", "5"],
    correctAnswer: 2
  },
  {
    id: "APT_11",
    section: "aptitude",
    sectionLabel: "Aptitude",
    text: "If 4 salespeople can close 24 deals in 3 days, how many deals can 6 salespeople close in 3 days?",
    options: ["30", "32", "36", "40"],
    correctAnswer: 2
  },
  {
    id: "APT_12",
    section: "aptitude",
    sectionLabel: "Aptitude",
    text: "A client buys 3 units at ₹4,500 each and gets 1 unit free. What is the effective cost per unit?",
    options: ["₹3,000", "₹3,375", "₹3,500", "₹4,000"],
    correctAnswer: 1
  }
];

export const SECTION_CONFIG = {
  intent: { label: "Section 1 — Mandatory Questions", maxScore: 21, weight: 25 },
  english: { label: "English Communication", maxScore: 12, weight: 25 },
  sales: { label: "Sales Judgement", maxScore: 12, weight: 20 },
  personality: { label: "Personality & Resilience", maxScore: 12, weight: 20 },
  aptitude: { label: "Aptitude", maxScore: 12, weight: 10 }
};
