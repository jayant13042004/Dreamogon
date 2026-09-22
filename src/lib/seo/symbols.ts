export interface DreamSymbol {
  slug: string;
  name: string;
  category: 'Nature' | 'Animals' | 'Objects' | 'Body & Health' | 'Actions & States' | 'Places';
  quickAnswer: string;
  commonInterpretations: Array<{
    scenario: string;
    meaning: string;
  }>;
  emotionalContext: string;
  questionsToAsk: string[];
  scientificContext: string;
  relatedSymbolSlugs: string[];
}

export const DREAM_SYMBOLS: DreamSymbol[] = [
  {
    slug: 'water',
    name: 'Water',
    category: 'Nature',
    quickAnswer: 'Water in dreams universally mirrors the state of your emotional consciousness—ranging from serene clarity in calm lakes to overwhelming turbulence in stormy seas.',
    commonInterpretations: [
      {
        scenario: 'Calm, clear water or serene lake',
        meaning: 'Represents emotional peace, mental lucidity, deep contentment, or restorative balance.'
      },
      {
        scenario: 'Turbulent oceans, high waves, or tsunamis',
        meaning: 'Signals feeling overwhelmed by sudden life changes, repressed stress, or uncontrollable emotions.'
      },
      {
        scenario: 'Deep dark abyss or drowning',
        meaning: 'Points toward fear of being consumed by unconscious anxieties or feeling out of your depth in waking responsibilities.'
      },
      {
        scenario: 'Drinking fresh water or flowing streams',
        meaning: 'Symbolizes spiritual rejuvenation, fresh perspectives, or creative vitality.'
      }
    ],
    emotionalContext: 'Water corresponds to fluidity, adaptability, and how you regulate internal feelings when faced with external pressure.',
    questionsToAsk: [
      'Was the water crystal clear, murky, frozen, or surging?',
      'Did you feel comforted, refreshed, or terrified of being engulfed?',
      'What waking situation feels unpredictable or emotionally demanding right now?'
    ],
    scientificContext: 'Cognitive dream research suggests aqueous environments frequently appear when the limbic system is synthesizing intense emotional experiences during REM sleep.',
    relatedSymbolSlugs: ['ocean', 'falling', 'flying', 'driving']
  },
  {
    slug: 'flying',
    name: 'Flying',
    category: 'Actions & States',
    quickAnswer: 'Flying in dreams often symbolizes freedom, transcendence, gaining a higher perspective, or breaking free from waking life constraints.',
    commonInterpretations: [
      {
        scenario: 'Effortless soaring above landscapes',
        meaning: 'Signifies self-confidence, liberation from past burdens, or viewing life from an expansive macroscopic perspective.'
      },
      {
        scenario: 'Struggling to gain altitude or hitting obstacles',
        meaning: 'Reflects self-doubt, external friction holding you back, or fear of ambitious goals.'
      },
      {
        scenario: 'Sudden loss of flight control',
        meaning: 'Indicates anxiety regarding maintaining high standards or fear of an inevitable fall from success.'
      }
    ],
    emotionalContext: 'Associated with empowerment, autonomy, ambition, or the desire to escape restrictive waking obligations.',
    questionsToAsk: [
      'Were you flying with wings, swimming through the air, or floating effortlessly?',
      'Were you escaping danger or joyfully exploring the horizon?',
      'Where in waking life do you crave greater freedom or autonomy?'
    ],
    scientificContext: 'Vestibular activation during REM sleep frequently generates sensations of weightlessness and aerial movement in conscious perception.',
    relatedSymbolSlugs: ['falling', 'ocean', 'water']
  },
  {
    slug: 'falling',
    name: 'Falling',
    category: 'Actions & States',
    quickAnswer: 'Falling dreams typically represent feelings of insecurity, loss of control, vulnerability, or apprehension regarding an unpredictable situation.',
    commonInterpretations: [
      {
        scenario: 'Endless plummeting into darkness',
        meaning: 'Reflects feeling powerless to halt a negative trajectory or severe waking exhaustion.'
      },
      {
        scenario: 'Falling and waking up with a jerk (hypnic jerk)',
        meaning: 'A physiological transition between waking and sleep where muscle relaxation is misinterpreted as a physical drop.'
      },
      {
        scenario: 'Slipping from a ledge or mountain cliff',
        meaning: 'Points to fragile stability in career, finances, or personal relationships.'
      }
    ],
    emotionalContext: 'Deeply tied to trust, stability, and fear of failure or abandonment.',
    questionsToAsk: [
      'Did you try to grab onto something or surrender to the drop?',
      'Where in life do you feel the ground is unstable beneath you?'
    ],
    scientificContext: 'Often accompanied by sudden blood pressure drops and motor cortex deactivation during sleep onset and early REM stages.',
    relatedSymbolSlugs: ['flying', 'being-chased', 'teeth']
  },
  {
    slug: 'teeth',
    name: 'Teeth Falling Out',
    category: 'Body & Health',
    quickAnswer: 'Teeth falling out or crumbling is one of the most common universal dream motifs, frequently related to communication anxiety, social vulnerability, or aging transitions.',
    commonInterpretations: [
      {
        scenario: 'Teeth crumbling into powder',
        meaning: 'Symbolizes feeling powerless to articulate yourself or fear of saying the wrong thing.'
      },
      {
        scenario: 'Pulling loose teeth painlessly',
        meaning: 'Reflects shedding old identities, transitions, or letting go of outdated expectations.'
      },
      {
        scenario: 'Teeth falling out in front of a crowd',
        meaning: 'Highlights fear of public embarrassment, impostor syndrome, or social judgment.'
      }
    ],
    emotionalContext: 'Relates to self-image, voice, confidence, and fear of losing vitality or social standing.',
    questionsToAsk: [
      'Did you feel pain or distress, or were you trying to conceal the missing teeth?',
      'Have you recently held back from expressing an important truth?'
    ],
    scientificContext: 'Studies correlate dental dreams with nocturnal bruxism (jaw clenching) and elevated waking stress levels.',
    relatedSymbolSlugs: ['falling', 'being-chased']
  },
  {
    slug: 'being-chased',
    name: 'Being Chased',
    category: 'Actions & States',
    quickAnswer: 'Being pursued or chased in a dream reflects avoidance of an uncomfortable waking confrontation, pending deadline, or neglected emotion.',
    commonInterpretations: [
      {
        scenario: 'Being chased by an unknown shadowy figure',
        meaning: 'Often represents Jungian "Shadow" aspects—repressed fears, guilt, or disowned desires.'
      },
      {
        scenario: 'Chased by a wild animal or predator',
        meaning: 'Points to instinctual aggression, fear of raw emotions, or feeling physically overwhelmed.'
      },
      {
        scenario: 'Running in slow motion unable to escape',
        meaning: 'Highlights feeling paralyzed or incapacitated in resolving an urgent waking crisis.'
      }
    ],
    emotionalContext: 'Flight-or-fight sympathetic nervous system activation triggered by avoidance behavior.',
    questionsToAsk: [
      'Who or what was pursuing you?',
      'What difficult conversation or decision are you avoiding in waking life?'
    ],
    scientificContext: 'Direct manifestation of evolutionary Threat Simulation Theory (TST) activating survival defense circuits.',
    relatedSymbolSlugs: ['falling', 'water', 'driving']
  },
  {
    slug: 'ocean',
    name: 'Ocean & Waves',
    category: 'Nature',
    quickAnswer: 'The vast ocean represents the collective unconscious, infinite potential, deep instinctual depths, or the magnitude of life transitions.',
    commonInterpretations: [
      {
        scenario: 'Gazing across an endless serene ocean',
        meaning: 'Symbolizes expansive clarity, meditation, and readiness for a grand journey.'
      },
      {
        scenario: 'Gigantic tidal waves on the horizon',
        meaning: 'Signals looming emotional upheaval or major unavoidable shifts.'
      }
    ],
    emotionalContext: 'Depth, mystery, vast subconscious horizons.',
    questionsToAsk: [
      'Were you on a ship, standing on shore, or swimming in the open water?'
    ],
    scientificContext: 'Associated with deep memory consolidation where past, present, and hypothetical futures are synthesized.',
    relatedSymbolSlugs: ['water', 'flying']
  },
  {
    slug: 'driving',
    name: 'Driving / Vehicles',
    category: 'Objects',
    quickAnswer: 'Driving reflects your perceived control over your personal life direction, autonomy, and how effectively you are navigating career or personal goals.',
    commonInterpretations: [
      {
        scenario: 'Driving smoothly on an open highway',
        meaning: 'Represents alignment, purpose, and confidence in your path forward.'
      },
      {
        scenario: 'Brakes failing or losing steering control',
        meaning: 'Reflects anxiety about being unable to stop an undesirable outcome or feeling out of control.'
      },
      {
        scenario: 'Someone else driving while you are in the passenger seat',
        meaning: 'Signals feeling passive or letting others dictate your major life decisions.'
      }
    ],
    emotionalContext: 'Agency, destiny, autonomy, and direction.',
    questionsToAsk: [
      'Who was in the driver seat?',
      'Was the road clear, foggy, winding, or blocked?'
    ],
    scientificContext: 'Cognitive simulation of decision-making and executive motor planning.',
    relatedSymbolSlugs: ['being-chased', 'falling']
  }
];
