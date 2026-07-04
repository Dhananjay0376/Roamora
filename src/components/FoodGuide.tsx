import React, { useState } from 'react';
import { FoodItem } from '../types';
import { Utensils, BookOpen, Clock, Heart, Sparkles, MapPin, Check } from 'lucide-react';
import PlaceMapModal from './PlaceMapModal';
import { convertPriceString, LocalCurrency } from '../utils/currency';

interface FoodGuideProps {
  foodItems: FoodItem[];
  destination?: string;
  preferredCurrency?: string;
  localCurrency?: LocalCurrency;
}

export default function FoodGuide({
  foodItems,
  destination = '',
  preferredCurrency = 'INR',
  localCurrency
}: FoodGuideProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [activeMapPlace, setActiveMapPlace] = useState<string | null>(null);

  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Street Food', 'Dessert', 'Drink'];

  const filteredItems = selectedCategory === 'All'
    ? foodItems
    : foodItems.filter(item => item.category === selectedCategory);

  const toggleFavorite = (name: string) => {
    setFavorites(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  return (
    <div className="space-y-6" id="food-guide-view">
      {/* Category Toggles */}
      <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            id={`food-cat-${cat.toLowerCase().replace(' ', '-')}`}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
              selectedCategory === cat
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/50 font-semibold'
                : 'bg-zinc-950 text-zinc-400 border-zinc-900 hover:border-zinc-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Dishes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredItems.map((food, idx) => {
          const isFav = favorites[food.name];
          return (
            <div
              key={idx}
              id={`food-item-${idx}`}
              className="bg-zinc-950/75 border border-zinc-900 hover:border-zinc-800/80 transition-all rounded-xl p-5 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header row */}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="inline-block px-2 py-0.5 text-[9px] font-mono font-semibold bg-amber-950/60 text-amber-500 border border-amber-900/50 rounded mb-1.5 uppercase">
                      {food.category}
                    </span>
                    <h4 className="text-md font-bold text-white font-sans leading-snug">
                      {food.name}
                    </h4>
                  </div>

                  <button
                    type="button"
                    id={`food-fav-${idx}`}
                    onClick={() => toggleFavorite(food.name)}
                    className={`p-1.5 rounded-lg border transition-all ${
                      isFav
                        ? 'bg-red-950/30 border-red-500/50 text-red-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Heart className="h-3.5 w-3.5 fill-current" />
                  </button>
                </div>

                {/* Historical Context */}
                <div className="text-xs text-zinc-400 leading-relaxed font-sans border-l-2 border-amber-500/30 pl-3 italic">
                  "{food.history}"
                </div>

                {/* Key Ingredients checklist */}
                <div className="space-y-1">
                  <div className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> Core Native Ingredients
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {food.ingredients.map((ing, i) => {
                      const ingText = typeof ing === 'string'
                        ? ing
                        : (ing && typeof ing === 'object' && 'name' in ing)
                          ? (ing as any).name
                          : JSON.stringify(ing);
                      return (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 text-[10px] font-mono"
                        >
                          {ingText}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Proper Table Etiquette - Step 7 */}
                <div className="bg-zinc-900/60 border border-zinc-800/40 rounded-lg p-3 space-y-1">
                  <div className="text-[10px] font-mono uppercase font-bold text-amber-500 flex items-center gap-1.5">
                    <Utensils className="h-3 w-3 text-amber-400" />
                    Indigenous Table Etiquette
                  </div>
                  <p className="text-[11px] text-zinc-300 font-sans leading-normal">
                    {food.etiquette}
                  </p>
                </div>
              </div>

              {/* Bottom footer block */}
              <div className="border-t border-zinc-900 pt-3 mt-4 space-y-2 text-[11px] font-mono">
                <div className="flex items-center justify-between text-zinc-400 gap-2">
                  <span className="flex items-center gap-1 shrink-0">
                    <MapPin className="h-3 w-3 text-amber-500" />
                    <span>Best place to try:</span>
                  </span>
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-white font-medium font-sans truncate" title={food.bestPlace}>{food.bestPlace}</span>
                    <button
                      type="button"
                      id={`btn-map-food-${idx}`}
                      onClick={() => setActiveMapPlace(food.bestPlace)}
                      className="text-[9px] text-amber-400 hover:text-white bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded transition-all cursor-pointer shrink-0 font-bold"
                    >
                      Map
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-zinc-400">
                  <span>Approximate cost:</span>
                  <span className="text-amber-400 font-medium">{convertPriceString(food.cost, preferredCurrency, localCurrency)}</span>
                </div>

                {food.dietaryNotes && food.dietaryNotes !== 'None' && (
                  <div className="text-[10px] text-green-400/90 bg-green-950/20 px-2 py-0.5 rounded border border-green-900/30 text-center">
                    Dietary: {food.dietaryNotes}
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>
      {activeMapPlace && (
        <PlaceMapModal
          isOpen={!!activeMapPlace}
          onClose={() => setActiveMapPlace(null)}
          placeName={activeMapPlace}
          destination={destination}
        />
      )}
    </div>
  );
}
