/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { GameMode, MapTheme, ParachuteEntity, PlayerInput, RoundResult, SavedClass } from './types/game';
import { PRESET_CLASSES, PARACHUTE_COLORS, getZonesForTheme } from './services/presets';
import { sounds } from './services/soundEffects';
import { SetupScreen } from './components/SetupScreen';
import { ParachuteCanvas } from './components/ParachuteCanvas';
import { GameHUD } from './components/GameHUD';
import { ResultModal } from './components/ResultModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ClassModal } from './components/ClassModal';
import { HowItWorksModal } from './components/HowItWorksModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { getStoredApiKey } from './services/geminiService';

export default function App() {
  // 1. Saved Classes State with LocalStorage
  const [classes, setClasses] = useState<SavedClass[]>(() => {
    try {
      const stored = localStorage.getItem('parachute_classes_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return PRESET_CLASSES.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      names: [...p.names],
      updatedAt: Date.now(),
    }));
  });

  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    try {
      const storedId = localStorage.getItem('parachute_selected_class_id');
      if (storedId) return storedId;
    } catch {
      // Ignore
    }
    return classes[0]?.id || 'class_10a1';
  });

  // Current active class
  const activeClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || classes[0];
  }, [classes, selectedClassId]);

  // 2. Active Roster Input Text
  const [namesText, setNamesText] = useState<string>(() => {
    return activeClass?.names.join('\n') || '';
  });

  // Save classes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('parachute_classes_v1', JSON.stringify(classes));
      localStorage.setItem('parachute_selected_class_id', selectedClassId);
    } catch {
      // Ignore storage errors
    }
  }, [classes, selectedClassId]);

  // Check if current text has unsaved changes compared to selected class
  const hasUnsavedChanges = useMemo(() => {
    if (!activeClass) return false;
    const currentList = namesText
      .split(/[\r\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const savedList = activeClass.names;
    if (currentList.length !== savedList.length) return true;
    for (let i = 0; i < currentList.length; i++) {
      if (currentList[i] !== savedList[i]) return true;
    }
    return false;
  }, [namesText, activeClass]);

  // Save current roster into active class
  const handleSaveCurrentClassChanges = useCallback(() => {
    if (!activeClass) return;
    const updatedNames = namesText
      .split(/[\r\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    setClasses((prev) =>
      prev.map((c) =>
        c.id === activeClass.id
          ? { ...c, names: updatedNames, updatedAt: Date.now() }
          : c
      )
    );
  }, [activeClass, namesText]);

  // Select class
  const handleSelectClass = useCallback(
    (id: string) => {
      setSelectedClassId(id);
      const found = classes.find((c) => c.id === id);
      if (found) {
        setNamesText(found.names.join('\n'));
      }
    },
    [classes]
  );

  // Create new class
  const handleCreateClass = useCallback(
    (name: string, description: string) => {
      const currentNames = namesText
        .split(/[\r\n,]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const newClass: SavedClass = {
        id: `class_${Date.now()}`,
        name,
        description,
        names: currentNames.length > 0 ? currentNames : ['Học sinh 1', 'Học sinh 2', 'Học sinh 3'],
        updatedAt: Date.now(),
      };

      setClasses((prev) => [...prev, newClass]);
      setSelectedClassId(newClass.id);
      setNamesText(newClass.names.join('\n'));
    },
    [namesText]
  );

  // Update class metadata
  const handleUpdateClassMeta = useCallback((id: string, name: string, description: string) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name, description, updatedAt: Date.now() } : c))
    );
  }, []);

  // Delete class
  const handleDeleteClass = useCallback(
    (id: string) => {
      setClasses((prev) => {
        const remaining = prev.filter((c) => c.id !== id);
        if (selectedClassId === id && remaining.length > 0) {
          setSelectedClassId(remaining[0].id);
          setNamesText(remaining[0].names.join('\n'));
        }
        return remaining;
      });
    },
    [selectedClassId]
  );

  // Reset to default presets
  const handleResetToDefaults = useCallback(() => {
    const defaults = PRESET_CLASSES.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      names: [...p.names],
      updatedAt: Date.now(),
    }));
    setClasses(defaults);
    setSelectedClassId(defaults[0].id);
    setNamesText(defaults[0].names.join('\n'));
  }, []);

  // 3. Game Settings State
  const [mode, setMode] = useState<GameMode>('CHALLENGE_ZONE');
  const [theme, setTheme] = useState<MapTheme>('TROPICAL_ISLAND');
  const [targetCount, setTargetCount] = useState<number>(1);
  const [windLevel, setWindLevel] = useState<'CALM' | 'BREEZE' | 'GUSTY'>('BREEZE');
  const [allowThermals, setAllowThermals] = useState<boolean>(true);
  const [fallSpeedMultiplier, setFallSpeedMultiplier] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // 4. Modals State
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Check for API key on mount; open modal if missing
  useEffect(() => {
    const key = getStoredApiKey();
    if (!key) {
      setIsApiKeyModalOpen(true);
    }
  }, []);

  // 5. Screen Navigation & Game Control
  const [screen, setScreen] = useState<'SETUP' | 'PLAYING'>('SETUP');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [forcedGustTrigger, setForcedGustTrigger] = useState<number>(0);
  const [roundKey, setRoundKey] = useState<number>(1);
  const [instantLandTrigger, setInstantLandTrigger] = useState<number>(0);

  // In-flight Live Stats
  const [gameStats, setGameStats] = useState({
    total: 0,
    landed: 0,
    inAir: 0,
    windSpeed: 0,
  });

  // Result State
  const [activeResult, setActiveResult] = useState<{
    chosen: ParachuteEntity[];
    allLandings: ParachuteEntity[];
  } | null>(null);

  // History State
  const [history, setHistory] = useState<RoundResult[]>(() => {
    try {
      const stored = localStorage.getItem('parachute_game_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('parachute_game_history', JSON.stringify(history));
    } catch {
      // Ignore
    }
  }, [history]);

  useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  // Parse raw text into structured PlayerInput array
  const parsedPlayers = useMemo<PlayerInput[]>(() => {
    const lines = namesText
      .split(/[\r\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    return lines.map((name, index) => ({
      id: `p_${index}_${name}`,
      name,
      avatarIndex: index % 16,
      color: PARACHUTE_COLORS[index % PARACHUTE_COLORS.length],
    }));
  }, [namesText]);

  // Zones corresponding to current theme
  const zones = useMemo(() => getZonesForTheme(theme), [theme]);

  // Start game handler
  const handleStartGame = () => {
    if (parsedPlayers.length === 0) return;
    sounds.unlockAudio();
    setActiveResult(null);
    setIsPaused(false);
    setFallSpeedMultiplier(1);
    setRoundKey((k) => k + 1);
    setScreen('PLAYING');
  };

  // Game finished callback from canvas
  const handleGameFinish = useCallback((results: {
    chosen: ParachuteEntity[];
    allLandings: ParachuteEntity[];
  }) => {
    setActiveResult(results);

    // Save round to history
    const newRound: RoundResult = {
      id: `round_${Date.now()}`,
      timestamp: Date.now(),
      mode,
      theme,
      chosenPlayers: results.chosen.map((c) => ({
        player: {
          id: c.id,
          name: c.name,
          avatarIndex: c.avatarIndex,
          color: c.color,
        },
        zone: c.landedZone,
        reason: c.landedZone?.label || 'Đã tiếp đất',
      })),
      allLandings: results.allLandings.map((l) => ({
        name: l.name,
        zoneName: l.landedZone?.name || '',
        zoneType: l.landedZone?.type || '',
        landTimeSec: l.landedTime || 0,
      })),
    };

    setHistory((prev) => [newRound, ...prev]);
  }, [mode, theme]);

  // Replay handler
  const handleReplay = () => {
    sounds.unlockAudio();
    setActiveResult(null);
    setIsPaused(false);
    setFallSpeedMultiplier(1);
    setRoundKey((k) => k + 1);
  };

  // Eliminate chosen player from list and immediately replay
  const handleEliminateChosen = (chosenIds: string[]) => {
    sounds.unlockAudio();
    const remaining = parsedPlayers.filter((p) => !chosenIds.includes(p.id));
    setNamesText(remaining.map((p) => p.name).join('\n'));
    setActiveResult(null);
    setIsPaused(false);
    setFallSpeedMultiplier(1);
    setRoundKey((k) => k + 1);
  };

  // Exit back to setup screen
  const handleExitGame = () => {
    setActiveResult(null);
    setScreen('SETUP');
  };

  // Manual wind gust trigger
  const handleTriggerGust = () => {
    setForcedGustTrigger((prev) => prev + 1);
  };

  // Instant land trigger
  const handleInstantLand = () => {
    setInstantLandTrigger((prev) => prev + 1);
  };

  // Global Keyboard Shortcuts for Classroom & Presenter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      // Don't intercept if user is typing text in an input
      if (isInput) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (screen === 'SETUP') {
          if (parsedPlayers.length > 0) {
            handleStartGame();
          }
        } else if (screen === 'PLAYING' && !activeResult) {
          setIsPaused((prev) => !prev);
        }
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      } else if (e.code === 'KeyG') {
        if (screen === 'PLAYING' && !activeResult) {
          e.preventDefault();
          handleTriggerGust();
        }
      } else if (e.code === 'KeyH') {
        if (screen === 'PLAYING' && !activeResult) {
          e.preventDefault();
          handleInstantLand();
        }
      } else if (e.code === 'KeyR') {
        if (screen === 'PLAYING') {
          e.preventDefault();
          handleReplay();
        }
      } else if (e.code === 'Escape') {
        if (activeResult) {
          handleExitGame();
        } else if (screen === 'PLAYING') {
          handleExitGame();
        } else if (isClassModalOpen) {
          setIsClassModalOpen(false);
        } else if (isHowItWorksOpen) {
          setIsHowItWorksOpen(false);
        } else if (isHistoryOpen) {
          setIsHistoryOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, activeResult, isClassModalOpen, isHowItWorksOpen, isHistoryOpen, parsedPlayers.length]);

  return (
    <div className="w-full h-screen overflow-hidden bg-slate-950 font-['Plus_Jakarta_Sans',sans-serif]">
      {screen === 'SETUP' ? (
        <SetupScreen
          namesText={namesText}
          onNamesTextChange={setNamesText}
          parsedPlayers={parsedPlayers}
          mode={mode}
          onModeChange={setMode}
          theme={theme}
          onThemeChange={setTheme}
          targetCount={targetCount}
          onTargetCountChange={setTargetCount}
          windLevel={windLevel}
          onWindLevelChange={setWindLevel}
          allowThermals={allowThermals}
          onAllowThermalsChange={setAllowThermals}
          soundEnabled={soundEnabled}
          onSoundEnabledChange={setSoundEnabled}
          onStartGame={handleStartGame}
          onOpenHistory={() => setIsHistoryOpen(true)}
          historyCount={history.length}
          classes={classes}
          selectedClassId={selectedClassId}
          onSelectClass={handleSelectClass}
          onSaveCurrentClassChanges={handleSaveCurrentClassChanges}
          onOpenClassManager={() => setIsClassModalOpen(true)}
          onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          hasUnsavedChanges={hasUnsavedChanges}
        />
      ) : (
        <div className="relative w-full h-full">
          {/* Top In-Game HUD Overlay */}
          <GameHUD
            mode={mode}
            total={gameStats.total || parsedPlayers.length}
            landed={gameStats.landed}
            inAir={gameStats.inAir}
            windSpeed={gameStats.windSpeed}
            fallSpeedMultiplier={fallSpeedMultiplier}
            soundEnabled={soundEnabled}
            isPaused={isPaused}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
            onTogglePause={() => setIsPaused(!isPaused)}
            onChangeSpeed={setFallSpeedMultiplier}
            onTriggerGust={handleTriggerGust}
            onInstantLand={handleInstantLand}
            onExitGame={handleExitGame}
          />

          {/* 2D Physics Canvas */}
          <ParachuteCanvas
            players={parsedPlayers}
            theme={theme}
            mode={mode}
            targetCount={targetCount}
            windLevel={windLevel}
            allowThermals={allowThermals}
            fallSpeedMultiplier={fallSpeedMultiplier}
            soundEnabled={soundEnabled}
            zones={zones}
            roundKey={roundKey}
            instantLandTrigger={instantLandTrigger}
            onGameFinish={handleGameFinish}
            onStatsUpdate={setGameStats}
            isPaused={isPaused}
            forcedGustTrigger={forcedGustTrigger}
          />

          {/* End-Game Result Freeze Modal */}
          {activeResult && (
            <ResultModal
              mode={mode}
              chosenPlayers={activeResult.chosen}
              allLandings={activeResult.allLandings}
              onReplay={handleReplay}
              onBackToSetup={handleExitGame}
              onEliminateChosen={handleEliminateChosen}
              onSaveToHistory={() => {}}
              onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
            />
          )}
        </div>
      )}

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={() => setHistory([])}
      />

      {/* Class Manager Modal */}
      <ClassModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        classes={classes}
        selectedClassId={selectedClassId}
        onSelectClass={handleSelectClass}
        onCreateClass={handleCreateClass}
        onUpdateClassMeta={handleUpdateClassMeta}
        onDeleteClass={handleDeleteClass}
        onResetToDefaults={handleResetToDefaults}
      />

      {/* How It Works Modal */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />

      {/* Model & API Key Settings Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />
    </div>
  );
}
