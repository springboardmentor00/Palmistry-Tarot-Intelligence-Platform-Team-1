// Tarot Deck Data - 78 Rider-Waite cards with upright & reversed meanings

export type CardOrientation = 'upright' | 'reversed';

export interface TarotCard {
  id: string;
  name: string;
  arcana: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
  number: number; // 0-21 for major, 1-14 for minor
  element?: string;
  keywords: string[];
  upright: string;
  reversed: string;
  symbol: string; // emoji or short glyph
  fortune: string; // emoji color/mood tag
}

export const MAJOR_ARCANA: TarotCard[] = [
  { id: 'major-0', name: 'The Fool', arcana: 'major', number: 0, element: 'Air', keywords: ['new beginnings', 'innocence', 'spontaneity'], upright: 'A leap of faith awaits you. Trust the journey and embrace the unknown with curiosity and an open heart.', reversed: 'Recklessness or hesitation clouds your path. Pause to ground yourself before taking the next step.', symbol: '🃏', fortune: '✨' },
  { id: 'major-1', name: 'The Magician', arcana: 'major', number: 1, element: 'Mercury', keywords: ['manifestation', 'willpower', 'skill'], upright: 'You hold all the tools you need. Focus your will and channel your resources to manifest your desires.', reversed: 'Manipulation or untapped talents. Reconnect with your true intentions and use your gifts wisely.', symbol: '🎩', fortune: '✨' },
  { id: 'major-2', name: 'The High Priestess', arcana: 'major', number: 2, element: 'Moon', keywords: ['intuition', 'mystery', 'subconscious'], upright: 'Listen to your inner voice. Secrets and wisdom are revealed when you trust your intuition.', reversed: 'Disconnect from inner wisdom. Take time for stillness and reflection to hear your truth again.', symbol: '🌙', fortune: '🔮' },
  { id: 'major-3', name: 'The Empress', arcana: 'major', number: 3, element: 'Venus', keywords: ['abundance', 'nurturing', 'fertility'], upright: 'Creativity and abundance flow to you. Nurture your projects, relationships, and self with loving care.', reversed: 'Creative block or smothering. Find balance between giving and receiving to restore your flow.', symbol: '👑', fortune: '🌿' },
  { id: 'major-4', name: 'The Emperor', arcana: 'major', number: 4, element: 'Aries', keywords: ['authority', 'structure', 'control'], upright: 'Take charge with discipline. Establish structure and lead with steady, confident authority.', reversed: 'Rigidity or domination. Soften your grip and allow flexibility to enter your plans.', symbol: '🏛️', fortune: '⚔️' },
  { id: 'major-5', name: 'The Hierophant', arcana: 'major', number: 5, element: 'Taurus', keywords: ['tradition', 'spiritual wisdom', 'conformity'], upright: 'Seek guidance from tradition or a mentor. Sacred teachings offer clarity on your path.', reversed: 'Challenge conventional thinking. Forge your own spiritual path free from dogma.', symbol: '📿', fortune: '🕯️' },
  { id: 'major-6', name: 'The Lovers', arcana: 'major', number: 6, element: 'Gemini', keywords: ['love', 'harmony', 'choices'], upright: 'A meaningful union or important choice. Align your decisions with your deepest values.', reversed: 'Discord or imbalance in relationships. Revisit your priorities and recommit to what truly matters.', symbol: '💞', fortune: '💖' },
  { id: 'major-7', name: 'The Chariot', arcana: 'major', number: 7, element: 'Cancer', keywords: ['determination', 'victory', 'willpower'], upright: 'Victory through focus and discipline. Harness opposing forces and drive forward with purpose.', reversed: 'Lack of direction or scattered energy. Realign your goals before charging ahead.', symbol: '🏎️', fortune: '🏆' },
  { id: 'major-8', name: 'Strength', arcana: 'major', number: 8, element: 'Leo', keywords: ['courage', 'patience', 'compassion'], upright: 'Inner strength and gentle courage tame the wildness within. Lead with compassion, not force.', reversed: 'Self-doubt or suppressed emotions. Trust your resilience and face fears with kindness.', symbol: '🦁', fortune: '🔥' },
  { id: 'major-9', name: 'The Hermit', arcana: 'major', number: 9, element: 'Virgo', keywords: ['introspection', 'solitude', 'inner guidance'], upright: 'Withdraw to find your truth. Solitude illuminates the wisdom already within you.', reversed: 'Isolation or withdrawal. Reconnect with trusted others to balance your inner work.', symbol: '🕯️', fortune: '🌌' },
  { id: 'major-10', name: 'Wheel of Fortune', arcana: 'major', number: 10, element: 'Jupiter', keywords: ['cycles', 'destiny', 'change'], upright: 'Fortune turns in your favor. Embrace the cycles of change and trust the timing of your life.', reversed: 'Resistance to change or bad luck. Let go of what you cannot control and adapt gracefully.', symbol: '🎡', fortune: '🍀' },
  { id: 'major-11', name: 'Justice', arcana: 'major', number: 11, element: 'Libra', keywords: ['fairness', 'truth', 'law'], upright: 'Truth and fairness prevail. Make decisions with honesty, balance, and clear-eyed discernment.', reversed: 'Injustice or dishonesty. Restore integrity in your dealings and own your part.', symbol: '⚖️', fortune: '📜' },
  { id: 'major-12', name: 'The Hanged Man', arcana: 'major', number: 12, element: 'Neptune', keywords: ['surrender', 'new perspective', 'pause'], upright: 'A sacred pause reveals new perspective. Release resistance and let wisdom arrive through stillness.', reversed: 'Stalling or indecision. Reframe the situation and choose to move forward.', symbol: '🙃', fortune: '🌊' },
  { id: 'major-13', name: 'Death', arcana: 'major', number: 13, element: 'Scorpio', keywords: ['transformation', 'endings', 'rebirth'], upright: 'Profound transformation is at hand. Endings make space for powerful new beginnings.', reversed: 'Clinging to what has ended. Allow the old to fall away so renewal can begin.', symbol: '🦋', fortune: '🌑' },
  { id: 'major-14', name: 'Temperance', arcana: 'major', number: 14, element: 'Sagittarius', keywords: ['balance', 'moderation', 'patience'], upright: 'Blend opposites with patience. Harmony emerges when you honor both spirit and matter.', reversed: 'Imbalance or excess. Restore equilibrium through mindful, intentional choices.', symbol: '🕊️', fortune: '🌈' },
  { id: 'major-15', name: 'The Devil', arcana: 'major', number: 15, element: 'Capricorn', keywords: ['bondage', 'addiction', 'materialism'], upright: 'Examine attachments that bind you. Awareness is the first key to your freedom.', reversed: 'Breaking free from chains. Reclaim your power and release what no longer serves.', symbol: '⛓️', fortune: '🔥' },
  { id: 'major-16', name: 'The Tower', arcana: 'major', number: 16, element: 'Mars', keywords: ['upheaval', 'revelation', 'awakening'], upright: 'Sudden change dismantles false structures. Trust that this upheaval clears the way for truth.', reversed: 'Avoiding inevitable change. Face the collapse with courage — what remains will be solid ground.', symbol: '⚡', fortune: '🌋' },
  { id: 'major-17', name: 'The Star', arcana: 'major', number: 17, element: 'Aquarius', keywords: ['hope', 'inspiration', 'renewal'], upright: 'Hope returns after the storm. Renew your faith and let inspiration guide your next chapter.', reversed: 'Lost faith or discouragement. Reconnect with what lights you up from within.', symbol: '⭐', fortune: '🌠' },
  { id: 'major-18', name: 'The Moon', arcana: 'major', number: 18, element: 'Pisces', keywords: ['illusion', 'dreams', 'intuition'], upright: 'Walk through uncertainty with intuition as your guide. Not all is as it seems.', reversed: 'Confusion lifting. Truth emerges from the shadows; trust what you now see clearly.', symbol: '🌕', fortune: '🌫️' },
  { id: 'major-19', name: 'The Sun', arcana: 'major', number: 19, element: 'Sun', keywords: ['joy', 'success', 'vitality'], upright: 'Radiant joy and success are yours. Step into the light and celebrate your vitality.', reversed: 'Temporary clouding of joy. Reconnect with simple pleasures to reignite your inner sun.', symbol: '☀️', fortune: '🌟' },
  { id: 'major-20', name: 'Judgement', arcana: 'major', number: 20, element: 'Pluto', keywords: ['rebirth', 'awakening', 'calling'], upright: 'A higher calling awakens within. Answer the summons to live in alignment with your soul.', reversed: 'Self-judgment or avoidance. Offer yourself compassion and heed the call to renew.', symbol: '📯', fortune: '🌅' },
  { id: 'major-21', name: 'The World', arcana: 'major', number: 21, element: 'Saturn', keywords: ['completion', 'wholeness', 'achievement'], upright: 'A cycle completes in triumph. Honor your journey and prepare for the next grand adventure.', reversed: 'Incompletion or stagnation. Identify what remains and bring it to fulfilling closure.', symbol: '🌍', fortune: '🎉' },
];

const SUITS = [
  { suit: 'wands' as const, element: 'Fire 🔥', theme: 'passion, creativity, willpower', symbol: '🔥' },
  { suit: 'cups' as const, element: 'Water 💧', theme: 'emotions, relationships, intuition', symbol: '🍷' },
  { suit: 'swords' as const, element: 'Air 🌬️', theme: 'intellect, conflict, communication', symbol: '⚔️' },
  { suit: 'pentacles' as const, element: 'Earth 🌿', theme: 'material, body, resources', symbol: '🪙' },
];

const COURT_NAMES: Record<number, string> = {
  11: 'Page',
  12: 'Knight',
  13: 'Queen',
  14: 'King',
};

function minorUpright(name: string, suit: string, theme: string): string {
  return `The ${name} of ${suit.charAt(0).toUpperCase() + suit.slice(1)} speaks to ${theme}. New energy and opportunity arise in this domain — engage it with intention and presence.`;
}

function minorReversed(name: string, suit: string): string {
  return `The reversed ${name} of ${suit.charAt(0).toUpperCase() + suit.slice(1)} suggests a block or delay. Reflect on what is out of balance and recalibrate before moving forward.`;
}

function buildMinorArcana(): TarotCard[] {
  const cards: TarotCard[] = [];
  for (const s of SUITS) {
    // Number cards 1-10
    const cardNames: Record<number, string> = {
      1: 'Ace',
      2: 'Two',
      3: 'Three',
      4: 'Four',
      5: 'Five',
      6: 'Six',
      7: 'Seven',
      8: 'Eight',
      9: 'Nine',
      10: 'Ten',
    };
    for (let n = 1; n <= 14; n++) {
      const name = COURT_NAMES[n] ?? cardNames[n];
      const id = `minor-${s.suit}-${n}`;
      cards.push({
        id,
        name: `${name} of ${s.suit.charAt(0).toUpperCase() + s.suit.slice(1)}`,
        arcana: 'minor',
        suit: s.suit,
        number: n,
        element: s.element,
        keywords: [s.theme.split(',')[0].trim(), name.toLowerCase(), s.suit],
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
    id: 'single',
    name: 'Single Card',
    description: 'A quick daily draw for focused guidance.',
    cardCount: 1,
    positions: ['The Message'],
    icon: '🎯',
  },
  {
    id: 'three-card',
    name: 'Three Card Spread',
    description: 'Past, Present, Future — the classic triad.',
    cardCount: 3,
    positions: ['Past', 'Present', 'Future'],
    icon: '⚡',
  },
  {
    id: 'mind-body-spirit',
    name: 'Mind · Body · Spirit',
    description: 'A holistic snapshot of your inner landscape.',
    cardCount: 3,
    positions: ['Mind', 'Body', 'Spirit'],
    icon: '🧘',
  },
  {
    id: 'situation-action-outcome',
    name: 'Situation · Action · Outcome',
    description: 'Practical guidance for a decision you face.',
    cardCount: 3,
    positions: ['Situation', 'Action', 'Outcome'],
    icon: '🧭',
  },
  {
    id: 'celtic-cross',
    name: 'Celtic Cross',
    description: 'The ten-card deep dive — a complete reading.',
    cardCount: 10,
    positions: [
      'Present',
      'Challenge',
      'Foundation',
      'Recent Past',
      'Possible Outcome',
      'Near Future',
      'Your Influence',
      'External Influence',
      'Hopes & Fears',
      'Final Outcome',
    ],
    icon: '✨',
  },
];

// Fisher-Yates shuffle (deterministic if seed provided)
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
