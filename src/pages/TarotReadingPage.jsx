import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const TAROT_MAJOR_ARCANA = [
  { id: 0, name: 'The Fool', emoji: '🃏', meaning: 'New beginnings, innocence, spontaneity', reverse: 'Recklessness, risk-taking, naivety' },
  { id: 1, name: 'The Magician', emoji: '🎩', meaning: 'Manifestation, power, resourcefulness', reverse: 'Manipulation, poor planning, untapped talents' },
  { id: 2, name: 'The High Priestess', emoji: '🌙', meaning: 'Intuition, sacred knowledge, mystery', reverse: 'Secrets, disconnected from intuition, withdrawal' },
  { id: 3, name: 'The Empress', emoji: '👑', meaning: 'Femininity, abundance, nature', reverse: 'Creative block, dependence, emptiness' },
  { id: 4, name: 'The Emperor', emoji: '🏛️', meaning: 'Authority, structure, control', reverse: 'Domination, rigidity, inflexibility' },
  { id: 5, name: 'The Hierophant', emoji: '📿', meaning: 'Spiritual wisdom, tradition, conformity', reverse: 'Rebellion, subversiveness, new approaches' },
  { id: 6, name: 'The Lovers', emoji: '💕', meaning: 'Love, harmony, relationships', reverse: 'Disharmony, imbalance, misalignment' },
  { id: 7, name: 'The Chariot', emoji: '⚔️', meaning: 'Determination, willpower, victory', reverse: 'Lack of control, aggression, no direction' },
  { id: 8, name: 'Strength', emoji: '🦁', meaning: 'Inner strength, courage, patience', reverse: 'Self-doubt, weakness, insecurity' },
  { id: 9, name: 'The Hermit', emoji: '🏔️', meaning: 'Soul-searching, introspection, solitude', reverse: 'Isolation, loneliness, withdrawal' },
  { id: 10, name: 'Wheel of Fortune', emoji: '🎡', meaning: 'Good luck, karma, life cycles', reverse: 'Bad luck, resistance to change, breaking cycles' },
  { id: 11, name: 'Justice', emoji: '⚖️', meaning: 'Fairness, truth, law, cause and effect', reverse: 'Unfairness, dishonesty, lack of accountability' },
  { id: 12, name: 'The Hanged Man', emoji: '🙃', meaning: 'Sacrifice, release, new perspective', reverse: 'Stalling, needless sacrifice, fear of sacrifice' },
  { id: 13, name: 'Death', emoji: '🦋', meaning: 'Endings, change, transformation', reverse: 'Resistance to change, fear of change, stagnation' },
  { id: 14, name: 'Temperance', emoji: '🏺', meaning: 'Balance, moderation, patience', reverse: 'Imbalance, excess, lack of long-term vision' },
  { id: 15, name: 'The Devil', emoji: '⛓️', meaning: 'Shadow self, attachment, restriction', reverse: 'Release, freedom, breaking free' },
  { id: 16, name: 'The Tower', emoji: '⚡', meaning: 'Sudden change, upheaval, revelation', reverse: 'Fear of change, averting disaster, delay' },
  { id: 17, name: 'The Star', emoji: '⭐', meaning: 'Hope, faith, renewal, inspiration', reverse: 'Lack of faith, despair, discouragement' },
  { id: 18, name: 'The Moon', emoji: '🌕', meaning: 'Illusion, fear, anxiety, subconscious', reverse: 'Release of fear, repressed emotion, clarity' },
  { id: 19, name: 'The Sun', emoji: '☀️', meaning: 'Positivity, fun, warmth, success', reverse: 'Inner child, feeling down, overly optimistic' },
  { id: 20, name: 'Judgement', emoji: '📯', meaning: 'Rebirth, inner calling, absolution', reverse: 'Self-doubt, refusal to learn, self-judgement' },
  { id: 21, name: 'The World', emoji: '🌍', meaning: 'Completion, accomplishment, travel', reverse: 'Incompletion, shortcuts, delays' },
];

const SPREADS = [
  {
    id: 'single',
    name: 'Single Card',
    description: 'Quick daily insight',
    cardCount: 1,
    positions: ['Daily Guidance'],
    emoji: '🃏',
  },
  {
    id: 'three_card',
    name: 'Three Card',
    description: 'Past, Present, Future',
    cardCount: 3,
    positions: ['Past', 'Present', 'Future'],
    emoji: '🎴',
  },
  {
    id: 'relationship',
    name: 'Relationship Spread',
    description: 'Love & connections',
    cardCount: 5,
    positions: ['You', 'Partner', 'Connection', 'Strengths', 'Challenges'],
    emoji: '💕',
  },
  {
    id: 'career',
    name: 'Career Spread',
    description: 'Professional path',
    cardCount: 4,
    positions: ['Current Situation', 'Opportunity', 'Obstacle', 'Outcome'],
    emoji: '💼',
  },
  {
    id: 'celtic_cross',
    name: 'Celtic Cross',
    description: 'Deep life reading',
    cardCount: 10,
    positions: [
      'Present', 'Challenge', 'Foundation', 'Past',
      'Possibilities', 'Near Future', 'Self', 'Environment',
      'Hopes & Fears', 'Outcome',
    ],
    emoji: '✝️',
  },
  {
    id: 'life_path',
    name: 'Life Path',
    description: 'Soul journey insight',
    cardCount: 6,
    positions: ['Current Path', 'Crossing', 'Foundation', 'Guidance', 'Lesson', 'Destiny'],
    emoji: '🌟',
  },
];

const TarotCard = ({ card, position, isRevealed, onClick, index }) => {
  const isReversed = card?.isReversed;

  return (
    <div
      className="flex flex-col items-center cursor-pointer"
      onClick={onClick}
    >
      {/* Position Label */}
      <p className="text-xs text-gray-500 mb-2 text-center">{position}</p>

      {/* Card */}
      <div
        className={`relative w-24 h-40 sm:w-28 sm:h-44 rounded-xl border-2 transition-all duration-500 ${
          isRevealed
            ? isReversed
              ? 'bg-gradient-to-b from-red-900/40 to-dark-800 border-red-700/50 shadow-lg shadow-red-900/20'
              : 'bg-gradient-to-b from-primary-900/40 to-dark-800 border-primary-600/50 shadow-lg shadow-primary-900/20'
            : 'bg-gradient-to-b from-primary-800/60 to-dark-800 border-primary-700/30 hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-800/20'
        }`}
        style={isRevealed && isReversed ? { transform: 'rotate(180deg)' } : {}}
      >
        {isRevealed ? (
          <div className="flex flex-col items-center justify-center h-full p-2">
            <span className="text-2xl mb-1">{card?.emoji}</span>
            <p className="text-white text-[10px] font-medium text-center leading-tight">{card?.name}</p>
            {isReversed && (
              <span className="text-red-400 text-[9px] mt-1">Reversed</span>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <span className="text-3xl opacity-50">🔮</span>
            <p className="text-gray-500 text-[10px] mt-2">Click to reveal</p>
          </div>
        )}
      </div>

      {/* Reversed indicator below card */}
      {isRevealed && isReversed && (
        <span className="text-red-400 text-[9px] mt-1">↻ Reversed</span>
      )}
    </div>
  );
};

const TarotReadingPage = () => {
  const [selectedSpread, setSelectedSpread] = useState(null);
  const [drawnCards, setDrawnCards] = useState([]);
  const [revealedCards, setRevealedCards] = useState([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [readingComplete, setReadingComplete] = useState(false);

  const shuffleAndDraw = (count) => {
    setIsShuffling(true);
    setRevealedCards([]);
    setReadingComplete(false);

    setTimeout(() => {
      const shuffled = [...TAROT_MAJOR_ARCANA].sort(() => Math.random() - 0.5);
      const drawn = shuffled.slice(0, count).map((card) => ({
        ...card,
        isReversed: Math.random() > 0.7,
      }));
      setDrawnCards(drawn);
      setIsShuffling(false);
    }, 1500);
  };

  const selectSpread = (spread) => {
    setSelectedSpread(spread);
    setDrawnCards([]);
    setRevealedCards([]);
    setReadingComplete(false);
    shuffleAndDraw(spread.cardCount);
  };

  const revealCard = (index) => {
    if (revealedCards.includes(index)) return;
    const newRevealed = [...revealedCards, index];
    setRevealedCards(newRevealed);

    if (newRevealed.length === drawnCards.length) {
      setReadingComplete(true);
      toast.success('Reading complete! ✨');
    }
  };

  const revealAll = () => {
    setRevealedCards(drawnCards.map((_, i) => i));
    setReadingComplete(true);
    toast.success('Reading complete! ✨');
  };

  const resetReading = () => {
    setSelectedSpread(null);
    setDrawnCards([]);
    setRevealedCards([]);
    setReadingComplete(false);
  };

  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-mystical text-3xl gradient-text font-bold mb-2">🎴 Tarot Reading</h1>
          <p className="text-gray-400">Choose your spread and receive personalized tarot interpretations</p>
        </div>

        {!selectedSpread ? (
          /* Spread Selection */
          <div>
            <h2 className="font-mystical text-xl gradient-text text-center mb-6">Choose Your Spread</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {SPREADS.map((spread) => (
                <div
                  key={spread.id}
                  onClick={() => selectSpread(spread)}
                  className="glass-card p-6 hover:border-primary-600/30 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer"
                >
                  <div className="text-4xl mb-3">{spread.emoji}</div>
                  <h3 className="text-white font-semibold text-lg mb-1">{spread.name}</h3>
                  <p className="text-gray-400 text-sm mb-3">{spread.description}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary-900/30 text-primary-300 border border-primary-700/30">
                      {spread.cardCount} {spread.cardCount === 1 ? 'Card' : 'Cards'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Reading Area */
          <div>
            {/* Spread Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-mystical text-xl gradient-text">
                  {selectedSpread.emoji} {selectedSpread.name}
                </h2>
                <p className="text-gray-400 text-sm">{selectedSpread.description}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button onClick={resetReading} className="mystic-btn-outline text-sm">
                  ← New Spread
                </button>
                {drawnCards.length > 0 && revealedCards.length < drawnCards.length && (
                  <button onClick={revealAll} className="mystic-btn text-sm">
                    Reveal All
                  </button>
                )}
              </div>
            </div>

            {/* Shuffling Animation */}
            {isShuffling && (
              <div className="text-center py-12">
                <div className="text-5xl animate-float mb-4">🎴</div>
                <p className="text-gray-400">Shuffling the cards...</p>
                <div className="mt-4 flex justify-center space-x-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-16 h-24 rounded-lg bg-gradient-to-b from-primary-800/60 to-dark-800 border border-primary-700/30 animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    ></div>
                  ))}
                </div>
              </div>
            )}

            {/* Cards Display */}
            {!isShuffling && drawnCards.length > 0 && (
              <div className="glass-card p-6 mb-6">
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                  {drawnCards.map((card, index) => (
                    <TarotCard
                      key={index}
                      card={card}
                      position={selectedSpread.positions[index]}
                      isRevealed={revealedCards.includes(index)}
                      onClick={() => revealCard(index)}
                      index={index}
                    />
                  ))}
                </div>

                {/* Progress */}
                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Revealed: {revealedCards.length} / {drawnCards.length}</span>
                    <span>{Math.round((revealedCards.length / drawnCards.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-dark-800 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-primary-600 to-mystic-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${(revealedCards.length / drawnCards.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Interpretation */}
            {readingComplete && (
              <div className="glass-card p-6 border border-primary-600/30">
                <h2 className="font-mystical text-xl gradient-text mb-4">✨ Your Reading</h2>
                <div className="space-y-4">
                  {drawnCards.map((card, index) => (
                    <div key={index} className="p-4 rounded-lg bg-dark-800/30">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">{card.emoji}</span>
                        <div>
                          <h4 className="text-white font-medium">
                            {selectedSpread.positions[index]}: {card.name}
                          </h4>
                          {card.isReversed && (
                            <span className="text-red-400 text-xs">↻ Reversed</span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">
                        {card.isReversed ? card.reverse : card.meaning}
                      </p>
                      <div className="mt-2 p-2 rounded bg-dark-800/50">
                        <p className="text-primary-300 text-xs italic">
                          In the position of <strong>{selectedSpread.positions[index]}</strong>,{' '}
                          <strong>{card.name}</strong>{' '}
                          {card.isReversed ? '(Reversed)' : '(Upright)'} suggests that{' '}
                          {card.isReversed ? card.reverse.toLowerCase() : card.meaning.toLowerCase()}.{' '}
                          This is a time for reflection and understanding the deeper meaning of this energy in your life.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="mt-6 p-4 rounded-lg bg-primary-900/20 border border-primary-700/30">
                  <h3 className="text-primary-300 font-medium mb-2">🔮 Reading Summary</h3>
                  <p className="text-gray-400 text-sm">
                    Your <strong>{selectedSpread.name}</strong> reading reveals a journey of{' '}
                    {drawnCards[0]?.isReversed ? 'inner challenges' : 'growth and discovery'}.
                    The cards suggest that you are at a{' '}
                    {drawnCards[0]?.name === 'The Fool' ? 'beginning' : 'turning point'} in your path.
                    Trust the process and embrace the wisdom the cards offer.
                  </p>
                </div>

                <div className="mt-4 flex items-center space-x-3">
                  <button onClick={resetReading} className="mystic-btn text-sm">
                    New Reading 🔮
                  </button>
                  <button
                    onClick={() => {
                      toast.success('Reading saved! (Full feature coming in Milestone 3)');
                    }}
                    className="mystic-btn-outline text-sm"
                  >
                    Save Reading
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TarotReadingPage;