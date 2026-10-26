"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { VocabItem } from "@/data/course";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PronounceButton } from "./PronounceButton";
import {
  Volume2,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  Loader2,
  RotateCcw,
  BookOpen,
  Lightbulb,
} from "lucide-react";
import { loadVocabularyForUnit } from "@/lib/vocabulary-loader";
import { playSound } from "@/lib/sounds";

interface VocabularyTabProps {
  fallbackVocabulary: VocabItem[];
  unitId: number;
  /** Callback para navegar a la pestaña de Gramática */
  onGoToGrammar?: () => void;
}

/**
 * Parsea el campo `pronunciation` en IPA y simplified.
 */
function parsePronunciation(pron: string): { ipa: string; simplified: string } {
  const match = pron.match(/^(.+?)\s*\((.+)\)\s*$/);
  if (match) {
    return { ipa: match[1].trim(), simplified: match[2].trim() };
  }
  return { ipa: pron.trim(), simplified: "" };
}

type Phase = "welcome" | "learning" | "game" | "category-complete" | "all-complete";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function VocabularyTab({
  fallbackVocabulary,
  unitId,
  onGoToGrammar,
}: VocabularyTabProps) {
  const [showIpa, setShowIpa] = useState(true);
  const [showSimplified, setShowSimplified] = useState(true);
  const [vocabulary, setVocabulary] = useState<VocabItem[]>(fallbackVocabulary);
  const [loading, setLoading] = useState(true);

  const [phase, setPhase] = useState<Phase>("welcome");
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // Estado del juego
  const [gameOrder, setGameOrder] = useState<number[]>([]);
  const [gameStep, setGameStep] = useState(0);
  const [gameOptions, setGameOptions] = useState<string[] | null>(null);
  const [gameSelected, setGameSelected] = useState<string | null>(null);
  const [gameResult, setGameResult] = useState<"correct" | "incorrect" | null>(null);

  // Cargar vocabulario desde archivos .md
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const loaded = await loadVocabularyForUnit(unitId);
        if (cancelled) return;
        if (loaded && loaded.length > 0) {
          setVocabulary(loaded);
        } else {
          setVocabulary(fallbackVocabulary);
        }
      } catch {
        if (!cancelled) setVocabulary(fallbackVocabulary);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [unitId, fallbackVocabulary]);

  // Agrupar por categoría
  const categories = useMemo(() => {
    const map = new Map<string, VocabItem[]>();
    for (const item of vocabulary) {
      const arr = map.get(item.category) ?? [];
      arr.push(item);
      map.set(item.category, arr);
    }
    return Array.from(map.entries()).map(([name, items]) => ({ name, items }));
  }, [vocabulary]);

  const currentCategory = categories[currentCategoryIndex];
  const currentWord = currentCategory?.items[currentWordIndex];

  // Generar opciones para el juego (1 correcta + 2 incorrectas aleatorias)
  const generateGameOptions = useCallback(
    (correctItem: VocabItem): string[] => {
      const correct = correctItem.translation;
      // Obtener traducciones incorrectas de otras categorías o palabras
      const allTranslations = vocabulary.map((v) => v.translation);
      const wrong = allTranslations.filter((t) => t !== correct);
      const wrongShuffled = shuffleArray(wrong).slice(0, 2);
      return shuffleArray([correct, ...wrongShuffled]);
    },
    [vocabulary]
  );

  // Iniciar el juego de la categoría actual
  const startGame = useCallback(() => {
    if (!currentCategory) return;
    const order = shuffleArray(
      currentCategory.items.map((_, i) => i)
    );
    setGameOrder(order);
    setGameStep(0);
    const firstItem = currentCategory.items[order[0]];
    setGameOptions(generateGameOptions(firstItem));
    setGameSelected(null);
    setGameResult(null);
    setPhase("game");
  }, [currentCategory, generateGameOptions]);

  // Manejar selección en el juego
  const handleGameSelect = (option: string) => {
    if (gameResult !== null) return; // ya respondió

    const currentGameItem = currentCategory.items[gameOrder[gameStep]];
    const isCorrect = option === currentGameItem.translation;

    setGameSelected(option);
    setGameResult(isCorrect ? "correct" : "incorrect");
    playSound(isCorrect ? "correct" : "error");

    if (isCorrect) {
      // Avanzar al siguiente después de 1.2s
      setTimeout(() => {
        const nextStep = gameStep + 1;
        if (nextStep >= gameOrder.length) {
          // Completó todos los del juego → categoría completa
          setPhase("category-complete");
        } else {
          setGameStep(nextStep);
          const nextItem = currentCategory.items[gameOrder[nextStep]];
          setGameOptions(generateGameOptions(nextItem));
          setGameSelected(null);
          setGameResult(null);
        }
      }, 1200);
    } else {
      // Falló → volver a aprender la categoría después de 1.5s
      setTimeout(() => {
        setCurrentWordIndex(0);
        setPhase("learning");
      }, 1500);
    }
  };

  // Avanzar a la siguiente palabra en modo aprendizaje
  const nextWord = () => {
    if (!currentCategory) return;
    if (currentWordIndex < currentCategory.items.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      // Terminó todas las palabras → iniciar juego
      startGame();
    }
  };

  const prevWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
    }
  };

  // Avanzar a la siguiente categoría
  const nextCategory = () => {
    if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
      setCurrentWordIndex(0);
      setPhase("learning");
    } else {
      setPhase("all-complete");
    }
  };

  // Reiniciar todo
  const restartAll = () => {
    setCurrentCategoryIndex(0);
    setCurrentWordIndex(0);
    setPhase("welcome");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-primary mr-2" />
        <span className="text-sm text-muted-foreground">Cargando vocabulario…</span>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No hay vocabulario disponible para esta unidad.
      </div>
    );
  }

  /* ==================== PANTALLA DE BIENVENIDA ==================== */
  if (phase === "welcome") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-2xl w-full">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="text-6xl" aria-hidden>📖</div>
            <div>
              <h2 className="text-3xl font-bold mb-3">Vocabulario</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Escucha cada palabra, repite en voz alta y aprende la
                pronunciación correcta. Luego pon a prueba lo aprendido con un
                juego.
              </p>
            </div>

            {/* Toggles de pronunciación */}
            <div className="flex flex-wrap gap-2 justify-center">
              <ToggleChip
                active={showIpa}
                onClick={() => setShowIpa((v) => !v)}
                label="IPA"
              />
              <ToggleChip
                active={showSimplified}
                onClick={() => setShowSimplified((v) => !v)}
                label="Fonética"
              />
            </div>

            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-sm text-left">
              <p className="font-medium mb-2">📋 Cómo funciona:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Verás una palabra a la vez con su pronunciación</li>
                <li>Al terminar, jugarás a emparejar inglés con español</li>
                <li>Si fallas, volverás a repasar las palabras</li>
                <li>Si aciertas todas, pasarás a la siguiente categoría</li>
              </ol>
            </div>

            <Button
              size="lg"
              onClick={() => {
                setCurrentCategoryIndex(0);
                setCurrentWordIndex(0);
                setPhase("learning");
              }}
              className="min-h-[48px]"
            >
              <BookOpen className="size-5 mr-2" />
              Empezar a aprender
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ==================== MODO APRENDIZAJE (una palabra a la vez) ==================== */
  if (phase === "learning" && currentWord) {
    const { ipa, simplified } = parsePronunciation(currentWord.pronunciation);
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        {/* Barra de progreso de la categoría */}
        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="font-medium text-primary">
              {currentCategory.name}
            </span>
            <span className="text-muted-foreground">
              {currentWordIndex + 1} / {currentCategory.items.length}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{
                width: `${((currentWordIndex + 1) / currentCategory.items.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Tarjeta de la palabra — centrada, pantalla completa */}
        <Card className="max-w-2xl w-full">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            {/* Emoji grande */}
            {currentWord.emoji && (
              <div className="text-7xl" aria-hidden>
                {currentWord.emoji}
              </div>
            )}

            {/* Palabra en inglés */}
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-2">
                {currentWord.word}
              </h2>
              <PronounceButton
                text={currentWord.word.replace(/^\d+\s—\s/, "").replace(/^Letra\s/, "")}
                label="Escuchar"
                size="lg"
                variant="default"
              />
            </div>

            {/* Pronunciación */}
            {(showIpa || showSimplified) && (
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm">
                {showIpa && ipa && (
                  <span className="font-mono text-primary/70">{ipa}</span>
                )}
                {showSimplified && simplified && (
                  <span className="font-mono text-foreground/90 font-semibold">
                    ({simplified})
                  </span>
                )}
              </div>
            )}

            {/* Traducción */}
            <div className="pt-4 border-t">
              <p className="text-xl text-muted-foreground">
                {currentWord.translation}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Navegación */}
        <div className="flex items-center gap-3 w-full max-w-2xl justify-between">
          <Button
            variant="outline"
            onClick={prevWord}
            disabled={currentWordIndex === 0}
            className="min-h-[48px]"
          >
            <ArrowLeft className="size-5 mr-1" />
            Anterior
          </Button>

          <Button
            variant="ghost"
            onClick={() => setPhase("welcome")}
            className="text-muted-foreground"
          >
            <RotateCcw className="size-4 mr-1" />
            Reiniciar
          </Button>

          <Button
            onClick={nextWord}
            className="min-h-[48px]"
          >
            {currentWordIndex < currentCategory.items.length - 1 ? (
              <>
                Siguiente
                <ArrowRight className="size-5 ml-1" />
              </>
            ) : (
              <>
                <Trophy className="size-5 mr-1" />
                Jugar
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  /* ==================== MODO JUEGO ==================== */
  if (phase === "game" && currentCategory && gameOptions) {
    const currentGameItem = currentCategory.items[gameOrder[gameStep]];
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        {/* Barra de progreso del juego */}
        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="font-medium text-primary">
              🎮 Juego: {currentCategory.name}
            </span>
            <span className="text-muted-foreground">
              {gameStep + 1} / {gameOrder.length}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{
                width: `${((gameStep + 1) / gameOrder.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <Card className="max-w-2xl w-full">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <p className="text-sm text-muted-foreground">
              ¿Cuál es la traducción de?
            </p>

            {/* Palabra en inglés grande */}
            <div className="space-y-3">
              {currentGameItem.emoji && (
                <div className="text-5xl" aria-hidden>
                  {currentGameItem.emoji}
                </div>
              )}
              <h2 className="text-4xl font-bold">
                {currentGameItem.word}
              </h2>
              <PronounceButton
                text={currentGameItem.word.replace(/^\d+\s—\s/, "").replace(/^Letra\s/, "")}
                label="Escuchar"
                size="sm"
                variant="outline"
              />
            </div>

            {/* Opciones en español */}
            <div className="space-y-2 pt-4">
              {gameOptions.map((option) => {
                const isSelected = gameSelected === option;
                const isCorrect = option === currentGameItem.translation;
                const showResult = gameResult !== null;

                let className = "border-border hover:border-primary/50 hover:bg-muted/50";
                if (showResult) {
                  if (isCorrect) {
                    className = "border-emerald-400 bg-emerald-50 text-emerald-700";
                  } else if (isSelected && !isCorrect) {
                    className = "border-red-400 bg-red-50 text-red-700";
                  } else {
                    className = "border-border opacity-50";
                  }
                }

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleGameSelect(option)}
                    disabled={showResult}
                    className={`w-full px-4 py-4 rounded-lg border-2 transition-all text-lg font-medium min-h-[56px] ${className}`}
                  >
                    {option}
                    {showResult && isCorrect && (
                      <CheckCircle2 className="inline-block size-5 ml-2" />
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <XCircle className="inline-block size-5 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mensaje de resultado */}
            {gameResult === "correct" && (
              <p className="text-emerald-600 font-medium">
                ¡Correcto! 🎉
              </p>
            )}
            {gameResult === "incorrect" && (
              <p className="text-red-600 font-medium">
                Incorrecto. Volverás a repasar las palabras… 🔄
              </p>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center max-w-md">
          Tienes un solo intento por palabra. Si fallas, volverás al principio
          de la categoría para repasar todas las palabras.
        </p>
      </div>
    );
  }

  /* ==================== CATEGORÍA COMPLETADA ==================== */
  if (phase === "category-complete") {
    const isLastCategory = currentCategoryIndex >= categories.length - 1;
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-2xl w-full">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="text-6xl" aria-hidden>🎉</div>
            <div>
              <h2 className="text-2xl font-bold mb-2">
                ¡Categoría completada!
              </h2>
              <p className="text-muted-foreground">
                Aprendiste todas las palabras de{" "}
                <strong>{currentCategory.name}</strong> y acertaste el juego.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                size="lg"
                onClick={nextCategory}
                className="min-h-[48px]"
              >
                {isLastCategory ? (
                  <>
                    <Trophy className="size-5 mr-2" />
                    Finalizar vocabulario
                  </>
                ) : (
                  <>
                    Siguiente categoría: {categories[currentCategoryIndex + 1]?.name}
                    <ArrowRight className="size-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ==================== TODO COMPLETADO ==================== */
  if (phase === "all-complete") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-2xl w-full">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="text-7xl" aria-hidden>🏆</div>
            <div>
              <h2 className="text-3xl font-bold mb-2">
                ¡Vocabulario completado!
              </h2>
              <p className="text-muted-foreground">
                Aprendiste todas las palabras de la unidad y superaste todos
                los juegos. ¡Excelente trabajo!
              </p>
            </div>

            {/* Tip pedagógico */}
            <div className="rounded-lg bg-accent/10 border border-accent/30 p-4 text-left">
              <p className="text-sm flex items-start gap-2">
                <Lightbulb className="size-5 shrink-0 mt-0.5 text-accent-foreground" />
                <span>
                  <strong>Consejo:</strong> Escucha cada palabra, repítela en
                  voz alta 2 o 3 veces, y trata de recordar su significado sin
                  mirar la traducción. La repetición espaciada es la mejor
                  forma de memorizar vocabulario nuevo.
                </span>
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {onGoToGrammar && (
                <Button
                  size="lg"
                  onClick={onGoToGrammar}
                  className="min-h-[48px]"
                >
                  <BookOpen className="size-5 mr-2" />
                  Ir a Gramática
                </Button>
              )}
              <Button
                variant="outline"
                onClick={restartAll}
                className="min-h-[48px]"
              >
                <RotateCcw className="size-4 mr-2" />
                Repasar vocabulario
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

function ToggleChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all min-h-[32px] ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-muted-foreground border-border hover:bg-muted"
      }`}
      aria-pressed={active}
    >
      {active ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
      {label}
    </button>
  );
}
