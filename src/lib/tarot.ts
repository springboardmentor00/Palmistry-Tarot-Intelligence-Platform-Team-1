// lib/tarot.ts

// unified structure based on metabismuth/tarot-json
export type CardOrientation = 'upright' | 'reversed';
export type ArcanaType = 'Major Arcana' | 'Minor Arcana';
export type SuitType = 'Cups' | 'Swords' | 'Wands' | 'Pentacles' | null;

export interface TarotCard {
  id: string; // m00, c01, etc. - based on the image filename for simplicity
  name: string;
  arcana: ArcanaType;
  suit: SuitType;
  number: string; // Keeping as string "0" to match JSON number property
  keywords: string[]; // From existing lib
  meaning_up: string; // The full meanings from tarot.json, added for low-overhead access
  meaning_rev: string;
  img: string; // The specific scan filename from tarot-images.json (e.g., 'm00.jpg')
  reverse_img?: string; // Optional reversed filename, standard is just rotating img 180deg
  
  // existing (we keep these for current UI compatibility)
  element?: string;
  upright: string; // The simplified meaning previously in lib, we will overwrite this
  reversed: string; 
  symbol: string; // emoji glyph
  fortune: string; // emoji tag
}

export const MAJOR_ARCANA: TarotCard[] = [
  {
    id: 'm00', name: 'The Fool', arcana: 'Major Arcana', number: '0', suit: null, img: 'm00.jpg',
    element: 'Air', keywords: ['new beginnings', 'innocence', 'spontaneity'],
    meaning_up: 'Folly, mania, extravagance, intoxication, delirium, frenzy, bewrayment.',
    meaning_rev: 'Negligence, absence, distribution, carelessness, apathy, nullity, vanity.',
    upright: 'A leap of faith awaits you. Trust the journey and embrace the unknown with curiosity and an open heart.',
    reversed: 'Recklessness or hesitation clouds your path. Pause to ground yourself before taking the next step.',
    symbol: '🃏', fortune: '✨'
  },
  {
    id: 'm01', name: 'The Magician', arcana: 'Major Arcana', number: '1', suit: null, img: 'm01.jpg',
    element: 'Mercury', keywords: ['manifestation', 'willpower', 'skill'],
    meaning_up: 'Skill, wisdom, adroitness, flexibility; craft, cunning, art, practicing trickery.',
    meaning_rev: 'Physician, Magus, mental disease, disgrace, disquiet.',
    upright: 'You hold all the tools you need. Focus your will and channel your resources to manifest your desires.',
    reversed: 'Manipulation or untapped talents. Reconnect with your true intentions and use your gifts wisely.',
    symbol: '🎩', fortune: '✨'
  },
  {
    id: 'm02', name: 'The High Priestess', arcana: 'Major Arcana', number: '2', suit: null, img: 'm02.jpg',
    element: 'Moon', keywords: ['intuition', 'mystery', 'subconscious'],
    meaning_up: 'Secrets, mystery, the future as yet unrevealed; the woman who interests the Querent.',
    meaning_rev: 'Passion, moral or physical ardour, conceit, surface knowledge.',
    upright: 'Listen to your inner voice. Secrets and wisdom are revealed when you trust your intuition.',
    reversed: 'Disconnect from inner wisdom. Take time for stillness and reflection to hear your truth again.',
    symbol: '🌙', fortune: '🔮'
  },
  {
    id: 'm03', name: 'The Empress', arcana: 'Major Arcana', number: '3', suit: null, img: 'm03.jpg',
    element: 'Venus', keywords: ['abundance', 'nurturing', 'fertility'],
    meaning_up: 'Fruitfulness, action, initiative, length of days; the unknown, clandestine.',
    meaning_rev: 'Light, truth, the unravelling of involved matters, public rejoicings; vacillation.',
    upright: 'Creativity and abundance flow to you. Nurture your projects, relationships, and self with loving care.',
    reversed: 'Creative block or smothering. Find balance between giving and receiving to restore your flow.',
    symbol: '👑', fortune: '🌿'
  },
  {
    id: 'm04', name: 'The Emperor', arcana: 'Major Arcana', number: '4', suit: null, img: 'm04.jpg',
    element: 'Aries', keywords: ['authority', 'structure', 'control'],
    meaning_up: 'Stability, power, protection, realization; a great person; aid, reason, conviction.',
    meaning_rev: 'Benevolence, compassion, credit; also confusion to enemies, obstruction, immaturity.',
    upright: 'Take charge with discipline. Establish structure and lead with steady, confident authority.',
    reversed: 'Rigidity or domination. Soften your grip and allow flexibility to enter your plans.',
    symbol: '🏛️', fortune: '⚔️'
  },
  {
    id: 'm05', name: 'The Hierophant', arcana: 'Major Arcana', number: '5', suit: null, img: 'm05.jpg',
    element: 'Taurus', keywords: ['tradition', 'spiritual wisdom', 'conformity'],
    meaning_up: 'Marriage, alliance, captivity, servitude; mercy and goodness; inspiration.',
    meaning_rev: 'Society, good understanding, concord, over-kindness, weakness.',
    upright: 'Seek guidance from tradition or a mentor. Sacred teachings offer clarity on your path.',
    reversed: 'Challenge conventional thinking. Forge your own spiritual path free from dogma.',
    symbol: '📿', fortune: '🕯️'
  },
  {
    id: 'm06', name: 'The Lovers', arcana: 'Major Arcana', number: '6', suit: null, img: 'm06.jpg',
    element: 'Gemini', keywords: ['love', 'harmony', 'choices'],
    meaning_up: 'Attraction, love, beauty, trials overcome.',
    meaning_rev: 'Failure, foolish designs. Another account speaks of marriage frustrated.',
    upright: 'A meaningful union or important choice. Align your decisions with your deepest values.',
    reversed: 'Discord or imbalance in relationships. Revisit your priorities and recommit to what truly matters.',
    symbol: '💞', fortune: '💖'
  },
  {
    id: 'm07', name: 'The Chariot', arcana: 'Major Arcana', number: '7', suit: null, img: 'm07.jpg',
    element: 'Cancer', keywords: ['determination', 'victory', 'willpower'],
    meaning_up: 'Succour, providence; also war, triumph, presumption, vengeance, trouble.',
    meaning_rev: 'Riot, quarrel, dispute, litigation, defeat.',
    upright: 'Victory through focus and discipline. Harness opposing forces and drive forward with purpose.',
    reversed: 'Lack of direction or scattered energy. Realign your goals before charging ahead.',
    symbol: '🏎️', fortune: '🏆'
  },
  {
    id: 'm08', name: 'Strength', arcana: 'Major Arcana', number: '8', suit: null, img: 'm08.jpg',
    element: 'Leo', keywords: ['courage', 'patience', 'compassion'],
    meaning_up: 'Power, energy, action, courage, magnanimity; also complete success and honours.',
    meaning_rev: 'Despotism, abuse if power, weakness, discord, sometimes even disgrace.',
    upright: 'Inner strength and gentle courage tame the wildness within. Lead with compassion, not force.',
    reversed: 'Self-doubt or suppressed emotions. Trust your resilience and face fears with kindness.',
    symbol: '🦁', fortune: '🔥'
  },
  {
    id: 'm09', name: 'The Hermit', arcana: 'Major Arcana', number: '9', suit: null, img: 'm09.jpg',
    element: 'Virgo', keywords: ['introspection', 'solitude', 'inner guidance'],
    meaning_up: 'Prudence, circumspection; also and especially treason, dissimulation, roguery, corruption.',
    meaning_rev: 'Concealment, disguising, policy, fear, unreasoned caution.',
    upright: 'Withdraw to find your truth. Solitude illuminates the wisdom already within you.',
    reversed: 'Isolation or withdrawal. Reconnect with trusted others to balance your inner work.',
    symbol: '🕯️', fortune: '🌌'
  },
  {
    id: 'm10', name: 'Wheel of Fortune', arcana: 'Major Arcana', number: '10', suit: null, img: 'm10.jpg',
    element: 'Jupiter', keywords: ['cycles', 'destiny', 'change'],
    meaning_up: 'Destiny, fortune, success, elevation, luck, felicity.',
    meaning_rev: 'Increase, abundance, superfluity.',
    upright: 'Fortune turns in your favor. Embrace the cycles of change and trust the timing of your life.',
    reversed: 'Resistance to change or bad luck. Let go of what you cannot control and adapt gracefully.',
    symbol: '🎡', fortune: '🍀'
  },
  {
    id: 'm11', name: 'Justice', arcana: 'Major Arcana', number: '11', suit: null, img: 'm11.jpg',
    element: 'Libra', keywords: ['fairness', 'truth', 'law'],
    meaning_up: 'Equity, rightness, probity, executive; triumph of the deserving side at law.',
    meaning_rev: 'Law in all its departments, bigotry, bias, excessive severity.',
    upright: 'Truth and fairness prevail. Make decisions with honesty, balance, and clear-eyed discernment.',
    reversed: 'Injustice or dishonesty. Restore integrity in your dealings and own your part.',
    symbol: '⚖️', fortune: '📜'
  },
  {
    id: 'm12', name: 'The Hanged Man', arcana: 'Major Arcana', number: '12', suit: null, img: 'm12.jpg',
    element: 'Neptune', keywords: ['surrender', 'new perspective', 'pause'],
    meaning_up: 'Wisdom, circumspection, discernment, trials, sacrifice, intuition, divination, prophecy.',
    meaning_rev: 'Selfishness, the crowd, body politic.',
    upright: 'A sacred pause reveals new perspective. Release resistance and let wisdom arrive through stillness.',
    reversed: 'Stalling or indecision. Reframe the situation and choose to move forward.',
    symbol: '🙃', fortune: '🌊'
  },
  {
    id: 'm13', name: 'Death', arcana: 'Major Arcana', number: '13', suit: null, img: 'm13.jpg',
    element: 'Scorpio', keywords: ['transformation', 'endings', 'rebirth'],
    meaning_up: 'End, mortality, destruction, corruption; also, for a man, loss of a benefactor.',
    meaning_rev: 'Inertia, sleep, lethargy, petrifaction, somnambulism; hope destroyed.',
    upright: 'Profound transformation is at hand. Endings make space for powerful new beginnings.',
    reversed: 'Clinging to what has ended. Allow the old to fall away so renewal can begin.',
    symbol: '🦋', fortune: '🌑'
  },
  {
    id: 'm14', name: 'Temperance', arcana: 'Major Arcana', number: '14', suit: null, img: 'm14.jpg',
    element: 'Sagittarius', keywords: ['balance', 'moderation', 'patience'],
    meaning_up: 'Economy, moderation, frugality, management, accommodation.',
    meaning_rev: 'Things relating to churches, religions, sects, the priesthood.',
    upright: 'Blend opposites with patience. Harmony emerges when you honor both spirit and matter.',
    reversed: 'Imbalance or excess. Restore equilibrium through mindful, intentional choices.',
    symbol: '🕊️', fortune: '🌈'
  },
  {
    id: 'm15', name: 'The Devil', arcana: 'Major Arcana', number: '15', suit: null, img: 'm15.jpg',
    element: 'Capricorn', keywords: ['bondage', 'addiction', 'materialism'],
    meaning_up: 'Ravage, violence, vehemence, extraordinary efforts, force, fatality.',
    meaning_rev: 'Evil fatality, weakness, pettiness, blindness.',
    upright: 'Examine attachments that bind you. Awareness is the first key to your freedom.',
    reversed: 'Breaking free from chains. Reclaim your power and release what no longer serves.',
    symbol: '⛓️', fortune: '🔥'
  },
  {
    id: 'm16', name: 'The Tower', arcana: 'Major Arcana', number: '16', suit: null, img: 'm16.jpg',
    element: 'Mars', keywords: ['upheaval', 'revelation', 'awakening'],
    meaning_up: 'Misery, distress, indigence, adversity, calamity, disgrace, deception, ruin.',
    meaning_rev: 'According to one account, the same in a lesser degree; also oppression, imprisonment.',
    upright: 'Sudden change dismantles false structures. Trust that this upheaval clears the way for truth.',
    reversed: 'Avoiding inevitable change. Face the collapse with courage — what remains will be solid ground.',
    symbol: '⚡', fortune: '🌋'
  },
  {
    id: 'm17', name: 'The Star', arcana: 'Major Arcana', number: '17', suit: null, img: 'm17.jpg',
    element: 'Aquarius', keywords: ['hope', 'inspiration', 'renewal'],
    meaning_up: 'Loss, theft, privation, abandonment; another reading says-hope and bright prospects.',
    meaning_rev: 'Arrogance, haughtiness, impotence.',
    upright: 'Hope returns after the storm. Renew your faith and let inspiration guide your next chapter.',
    reversed: 'Lost faith or discouragement. Reconnect with what lights you up from within.',
    symbol: '⭐', fortune: '🌠'
  },
  {
    id: 'm18', name: 'The Moon', arcana: 'Major Arcana', number: '18', suit: null, img: 'm18.jpg',
    element: 'Pisces', keywords: ['illusion', 'dreams', 'intuition'],
    meaning_up: 'Hidden enemies, danger, calumny, darkness, terror, deception, occult forces, error.',
    meaning_rev: 'Instability, inconstancy, silence, lesser degrees of deception and error.',
    upright: 'Walk through uncertainty with intuition as your guide. Not all is as it seems.',
    reversed: 'Confusion lifting. Truth emerges from the shadows; trust what you now see clearly.',
    symbol: '🌕', fortune: '🌫️'
  },
  {
    id: 'm19', name: 'The Sun', arcana: 'Major Arcana', number: '19', suit: null, img: 'm19.jpg',
    element: 'Sun', keywords: ['joy', 'success', 'vitality'],
    meaning_up: 'Material happiness, fortunate marriage, contentment.',
    meaning_rev: 'The same in a lesser degree.',
    upright: 'Radiant joy and success are yours. Step into the light and celebrate your vitality.',
    reversed: 'Temporary clouding of joy. Reconnect with simple pleasures to reignite your inner sun.',
    symbol: '☀️', fortune: '🌟'
  },
  {
    id: 'm20', name: 'Judgement', arcana: 'Major Arcana', number: '20', suit: null, img: 'm20.jpg',
    element: 'Pluto', keywords: ['rebirth', 'awakening', 'calling'],
    meaning_up: 'Change of position, renewal, outcome. Another account says-total loss through lawsuit.',
    meaning_rev: 'Weakness, pusillanimity, simplicity; also deliberation, decision, sentence.',
    upright: 'A higher calling awakens within. Answer the summons to live in alignment with your soul.',
    reversed: 'Self-judgment or avoidance. Offer yourself compassion and heed the call to renew.',
    symbol: '📯', fortune: '🌅'
  },
  {
    id: 'm21', name: 'The World', arcana: 'Major Arcana', number: '21', suit: null, img: 'm21.jpg',
    element: 'Saturn', keywords: ['completion', 'wholeness', 'achievement'],
    meaning_up: 'Assured success, recompense, voyage, route, emigration, flight, change of place.',
    meaning_rev: 'Inertia, fixity, stagnation, permanence.',
    upright: 'A cycle completes in triumph. Honor your journey and prepare for the next grand adventure.',
    reversed: 'Incompletion or stagnation. Identify what remains and bring it to fulfilling closure.',
    symbol: '🌍', fortune: '🎉'
  },
];

// lib/tarot.ts (CONTINUED - paste this below MAJOR_ARCANA)

// Updating constants to use unified ArcanaType and SuitType
const SUITS: { suit: SuitType; element: string; theme: string; symbol: string; prefix: string }[] = [
  { suit: 'Wands', element: 'Fire 🔥', theme: 'passion, creativity, willpower', symbol: '🔥', prefix: 'w' },
  { suit: 'Cups', element: 'Water 💧', theme: 'emotions, relationships, intuition', symbol: '🍷', prefix: 'c' },
  { suit: 'Swords', element: 'Air 🌬️', theme: 'intellect, conflict, communication', symbol: '⚔️', prefix: 's' },
  { suit: 'Pentacles', element: 'Earth 🌿', theme: 'material, body, resources', symbol: '🪙', prefix: 'p' },
];

const COURT_NAMES: Record<number, string> = {
  1: 'Ace', // Added Ace here for simpler loop logic
  2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine', 10: 'Ten',
  11: 'Page', 12: 'Knight', 13: 'Queen', 14: 'King',
};

// Simplified meaning generators (we keep these as placeholders until full dataset meaning extraction)
function minorUpright(name: string, suit: string, theme: string): string {
  return `The ${name} of ${suit} speaks to ${theme}. New energy and opportunity arise in this domain — engage it with intention and presence.`;
}

function minorReversed(name: string, suit: string): string {
  return `The reversed ${name} of ${suit} suggests a block or delay. Reflect on what is out of balance and recalibrate before moving forward.`;
}

function buildMinorArcana(): TarotCard[] {
  const cards: TarotCard[] = [];
  for (const s of SUITS) {
    if (!s.suit) continue; // Safety check for null suit

    // Standard Tarot minor loop 1-14 (Ace through King)
    for (let n = 1; n <= 14; n++) {
      const name = COURT_NAMES[n];
      
      // Generate ID based on filename structure (e.g., 'c01', 'w12')
      // Pad single digits with a 0
      const numCode = n < 10 ? `0${n}` : `${n}`;
      const id = `${s.prefix}${numCode}`;
      
      // Generate the expected image filename (e.g., 'c01.jpg')
      const img = `${id}.jpg`;

      cards.push({
        id, // simple ID matching filename
        name: `${name} of ${s.suit}`,
        arcana: 'Minor Arcana',
        suit: s.suit,
        number: n.toString(), // string "1" through "14"
        img,
        element: s.element,
        // Existing placeholders, can be updated later
        keywords: [s.theme.split(',')[0].trim(), name.toLowerCase(), s.suit.toLowerCase()],
        meaning_up: `[PLACEHOLDER] Upright meaning for ${name} of ${s.suit}`,
        meaning_rev: `[PLACEHOLDER] Reversed meaning for ${name} of ${s.suit}`,
        upright: minorUpright(name, s.suit, s.theme),
        reversed: minorReversed(name, s.suit),
        symbol: s.symbol,
        fortune: s.symbol,
      });
    }
  }
  return cards;
}

export const MINOR_ARCANA: TarotCard[] = buildMinorArcana();

export const FULL_DECK: TarotCard[] = [...MAJOR_ARCANA, ...MINOR_ARCANA];

export const CARD_BY_ID: Record<string, TarotCard> = Object.fromEntries(
  FULL_DECK.map((c) => [c.id, c])
);

// We preserve the existing spread definitions and draw logic.
// They already use FULL_DECK, so they will automatically work with the new structure.

export interface SpreadDefinition {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  positions: string[];
  icon: string;
}

export const SPREADS: SpreadDefinition[] = [
  {
    id: 'single', name: 'Single Card', description: 'A quick daily draw for focused guidance.',
    cardCount: 1, positions: ['The Message'], icon: '🎯',
  },
  {
    id: 'three-card', name: 'Three Card Spread', description: 'Past, Present, Future — the classic triad.',
    cardCount: 3, positions: ['Past', 'Present', 'Future'], icon: '⚡',
  },
  {
    id: 'mind-body-spirit', name: 'Mind · Body · Spirit', description: 'A holistic snapshot of your inner landscape.',
    cardCount: 3, positions: ['Mind', 'Body', 'Spirit'], icon: '🧘',
  },
  {
    id: 'situation-action-outcome', name: 'Situation · Action · Outcome', description: 'Practical guidance for a decision you face.',
    cardCount: 3, positions: ['Situation', 'Action', 'Outcome'], icon: '🧭',
  },
  {
    id: 'celtic-cross', name: 'Celtic Cross', description: 'The ten-card deep dive — a complete reading.',
    cardCount: 10,
    positions: [
      'Present', 'Challenge', 'Foundation', 'Recent Past', 'Possible Outcome',
      'Near Future', 'Your Influence', 'External Influence', 'Hopes & Fears', 'Final Outcome',
    ],
    icon: '✨',
  },
];

// Existing Fisher-Yates shuffle remains perfect
export function drawCards(spread: SpreadDefinition, seed?: number): {
  card: TarotCard;
  orientation: CardOrientation;
  position: string;
}[] {
  const rng = mulberry32(seed ?? Math.floor(Math.random() * 1e9));
  const deck = [...FULL_DECK];
  // shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  const drawn = deck.slice(0, spread.cardCount);
  return drawn.map((card, idx) => ({
    card,
    orientation: rng() > 0.5 ? 'upright' : 'reversed',
    position: spread.positions[idx] ?? `Position ${idx + 1}`,
  }));
}

// Deterministic PRNG for repeatable draws
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}