import { useState } from 'react';
import { AddIdeaScreen } from './components/AddIdeaScreen';
import { AddMemoScreen } from './components/AddMemoScreen';
import { ArchivedIdeaDetailScreen } from './components/ArchivedIdeaDetailScreen';
import { CheckInScreen } from './components/CheckInScreen';
import { ConfirmationScreen } from './components/ConfirmationScreen';
import { ContractScreen } from './components/ContractScreen';
import { GoalCreationScreen } from './components/GoalCreationScreen';
import { HomeScreen } from './components/HomeScreen';
import { IdeaDetailScreen } from './components/IdeaDetailScreen';
import { IdeasListScreen, type Idea } from './components/IdeasListScreen';
import { InsightDetailScreen } from './components/InsightDetailScreen';
import { InsightsGeneratorScreen } from './components/InsightsGeneratorScreen';
import { InsightsListScreen } from './components/InsightsListScreen';
import { MicroButtonsScreen } from './components/MicroButtonsScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { ReflectionLogScreen } from './components/ReflectionLogScreen';
import { ReflectionScreen } from './components/ReflectionScreen';
import { ToneSettingsSheet } from './components/ToneSettingsSheet';
import { ToolsScreen } from './components/ToolsScreen';
import { VaultScreen } from './components/VaultScreen';
import { WhatNextScreen } from './components/WhatNextScreen';

export type Screen = 'onboarding' | 'home' | 'create' | 'micro-buttons' | 'contract' | 'checkin' | 'reflection' | 'whatnext' | 'log' | 'confirmation' | 'insights-generator' | 'insights-list' | 'ideas-list' | 'add-idea' | 'idea-detail' | 'vault' | 'archived-idea-detail' | 'tools' | 'insight-detail' | 'add-memo';

export interface SavedInsight {
  id: string;
  goalTitle?: string;
  goalStatus?: 'completed' | 'missed';
  summary: string;
  fullText: string;
  date: Date;
}

export interface Intention {
  id: string;
  text: string;
  dueDate: Date;
  voiceMemo?: Blob;
  textMemo?: string;
  completed?: boolean;
  mood?: string;
  reflectionVoice?: Blob;
  textReflection?: string;
  satisfaction?: number;
  checkInNotifications?: Date[];
  goalType?: string;
  feeling?: string;
  friction?: string;
  aiSummary?: string;
}

export default function App() {
  // Check localStorage for onboarding status
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    return localStorage.getItem('hasCompletedOnboarding') === 'true';
  });
  
  const [userTone, setUserTone] = useState(() => {
    return localStorage.getItem('userTone') || 'encouraging';
  });
  
  const [showToneSettings, setShowToneSettings] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>(
    hasCompletedOnboarding ? 'home' : 'onboarding'
  );
  const [showInsightsAdded, setShowInsightsAdded] = useState(false);
  const [showIdeasAdded, setShowIdeasAdded] = useState(false);
  const [intentions, setIntentions] = useState<Intention[]>([
    {
      id: '1',
      text: 'Finish landing page',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      voiceMemo: new Blob(['mock audio data'], { type: 'audio/webm' }),
    },
    {
      id: '2',
      text: 'Complete user research',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      voiceMemo: new Blob(['mock audio data'], { type: 'audio/webm' }),
    },
    {
      id: '3',
      text: 'Design new components',
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      voiceMemo: new Blob(['mock audio data'], { type: 'audio/webm' }),
    }
  ]);
  const [streak, setStreak] = useState(3);
  const [currentIntention, setCurrentIntention] = useState<Intention | null>(null);
  const [savedInsights, setSavedInsights] = useState<SavedInsight[]>([]);
  const [currentInsight, setCurrentInsight] = useState<SavedInsight | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [archivedIdeas, setArchivedIdeas] = useState<Idea[]>([]);
  const [currentIdea, setCurrentIdea] = useState<Idea | null>(null);
  const [ideaToConvert, setIdeaToConvert] = useState<Idea | null>(null);
  const [showMemoSaved, setShowMemoSaved] = useState(false);
  const [showGoalLockedIn, setShowGoalLockedIn] = useState(false);
  const [pendingIntention, setPendingIntention] = useState<Omit<Intention, 'id'> | null>(null);

  // Handle onboarding completion
  const handleOnboardingComplete = (tone: string) => {
    setUserTone(tone);
    setHasCompletedOnboarding(true);
    localStorage.setItem('hasCompletedOnboarding', 'true');
    localStorage.setItem('userTone', tone);
    setCurrentScreen('home');
  };

  // Handle tone change
  const handleToneChange = (tone: string) => {
    setUserTone(tone);
    localStorage.setItem('userTone', tone);
  };

  const upcomingIntentions = intentions
    .filter(i => !i.completed && !i.mood)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  const handleCreateIntention = (intention: Omit<Intention, 'id'>) => {
    setPendingIntention(intention);
    setCurrentScreen('micro-buttons');
  };

  const handleMicroButtonsComplete = (selections: {
    goalType?: string;
    feeling?: string;
    friction?: string;
  }) => {
    if (pendingIntention) {
      const intentionWithSelections = {
        ...pendingIntention,
        ...selections,
      };
      setPendingIntention(intentionWithSelections);
      setCurrentScreen('contract');
    }
  };

  const handleContractConfirm = () => {
    if (pendingIntention) {
      const newIntention = {
        ...pendingIntention,
        id: Date.now().toString(),
      };
      setIntentions([...intentions, newIntention]);
      
      if (ideaToConvert) {
        setIdeas(ideas.filter(i => i.id !== ideaToConvert.id));
        setIdeaToConvert(null);
      }
      
      setPendingIntention(null);
      setShowGoalLockedIn(true);
      setCurrentScreen('home');
      setTimeout(() => setShowGoalLockedIn(false), 3000);
    }
  };

  const handleCheckIn = (completed: boolean) => {
    if (currentIntention) {
      const updatedIntention = { ...currentIntention, completed };
      setCurrentIntention(updatedIntention);
      if (completed) {
        setCurrentScreen('reflection');
      } else {
        setCurrentScreen('confirmation');
      }
    }
  };

  const handleConfirmation = () => {
    setCurrentScreen('reflection');
  };

  const handleReflection = (mood: string, reflectionVoice: Blob | undefined, textReflection: string | undefined, satisfaction: number) => {
    if (currentIntention) {
      const updatedIntention = { 
        ...currentIntention, 
        mood, 
        reflectionVoice, 
        textReflection,
        satisfaction 
      };
      setIntentions(intentions.map(i => i.id === updatedIntention.id ? updatedIntention : i));
      setCurrentIntention(updatedIntention);
      if (updatedIntention.completed) {
        setStreak(streak + 1);
      }
      setCurrentScreen('whatnext');
    }
  };

  const handleSaveInsights = (insightText: string) => {
    const newInsight: SavedInsight = {
      id: Date.now().toString(),
      summary: insightText,
      fullText: insightText,
      date: new Date(),
    };
    setSavedInsights([...savedInsights, newInsight]);
    setShowInsightsAdded(true);
    setCurrentScreen('tools');
    setTimeout(() => setShowInsightsAdded(false), 2000);
  };

  const handleGenerateGoalInsights = (selectedGoals: Intention[]) => {
    const newInsights: SavedInsight[] = selectedGoals.map(goal => {
      const status: 'completed' | 'missed' = goal.completed ? 'completed' : 'missed';
      
      let summary: string;
      let fullText: string;
      
      if (status === 'completed') {
        summary = "Consistency and clear planning drove success";
        fullText = `Congratulations on completing "${goal.text}"! Your reflection shows a strong commitment to follow-through. Key factors in your success included breaking the task into manageable steps and maintaining consistent effort. The positive mood you recorded (${goal.mood}) indicates satisfaction with your approach. Consider applying these same strategies to future goals. Your ability to complete this goal demonstrates growing self-awareness and effective time management.`;
      } else {
        summary = "Time management and unexpected challenges were barriers";
        fullText = `While you didn't complete "${goal.text}", your honest reflection is valuable for growth. Common challenges that emerged include time constraints and competing priorities. Your reflection (${goal.mood}) shows emotional awareness about the outcome. Moving forward, consider setting more realistic timelines or breaking larger goals into smaller milestones. Remember, every experience—whether successful or not—provides insights that strengthen your future goal-setting abilities.`;
      }
      
      return {
        id: `${Date.now()}-${goal.id}`,
        goalTitle: goal.text,
        goalStatus: status,
        summary,
        fullText,
        date: new Date(),
      };
    });
    
    setSavedInsights([...newInsights, ...savedInsights]);
    setShowInsightsAdded(true);
    setCurrentScreen('insights-list');
    setTimeout(() => setShowInsightsAdded(false), 2000);
  };

  const handleSaveIdea = (idea: Omit<Idea, 'id' | 'createdDate'>) => {
    const newIdea: Idea = {
      ...idea,
      id: Date.now().toString(),
      createdDate: new Date(),
    };
    setIdeas([...ideas, newIdea]);
    setShowIdeasAdded(true);
    setCurrentScreen('tools');
    setTimeout(() => setShowIdeasAdded(false), 2000);
  };

  const handleArchiveIdea = (ideaId: string) => {
    const ideaToArchive = ideas.find(i => i.id === ideaId);
    if (ideaToArchive) {
      setIdeas(ideas.filter(i => i.id !== ideaId));
      setArchivedIdeas([...archivedIdeas, ideaToArchive]);
    }
  };

  const handleDeleteIdea = (ideaId: string) => {
    setIdeas(ideas.filter(i => i.id !== ideaId));
  };

  const handleUpdateIdeaNotification = (ideaId: string, notificationDate?: Date) => {
    setIdeas(ideas.map(idea => 
      idea.id === ideaId ? { ...idea, notificationDate } : idea
    ));
    if (currentIdea && currentIdea.id === ideaId) {
      setCurrentIdea({ ...currentIdea, notificationDate });
    }
  };

  const handleMakeGoal = (idea: Idea) => {
    setIdeaToConvert(idea);
    setCurrentScreen('create');
  };

  const handleAddMemo = (voiceMemo?: Blob, textMemo?: string) => {
    if (currentIntention) {
      const updatedIntention = {
        ...currentIntention,
        voiceMemo: voiceMemo || currentIntention.voiceMemo,
        textMemo: textMemo || currentIntention.textMemo,
      };
      setIntentions(intentions.map(i => i.id === updatedIntention.id ? updatedIntention : i));
      setCurrentIntention(updatedIntention);
      setShowMemoSaved(true);
      setCurrentScreen('home');
      setTimeout(() => setShowMemoSaved(false), 3000);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center p-4">
      <div className="w-full max-w-md h-[812px] bg-white rounded-[3rem] shadow-2xl overflow-hidden relative border-8 border-[#2E3F4F]">
        <div className="h-11 bg-white flex items-center justify-between px-8 pt-2">
          <span className="text-sm">9:41</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-3 border border-[#2E3F4F] rounded-sm" />
            <div className="w-1 h-2 bg-[#2E3F4F] rounded-sm" />
          </div>
        </div>

        <div className="h-[calc(100%-44px)] bg-gradient-to-b from-[#F5F3EF] to-[#E8E6E1] overflow-y-auto">
          {currentScreen === 'onboarding' && (
            <OnboardingScreen onComplete={handleOnboardingComplete} />
          )}
          {currentScreen === 'home' && (
            <HomeScreen
              upcomingIntentions={upcomingIntentions}
              streak={streak}
              onCreateNew={() => {
                setIdeaToConvert(null);
                setCurrentScreen('create');
              }}
              onViewLog={() => setCurrentScreen('log')}
              onViewTools={() => setCurrentScreen('tools')}
              onCheckIn={(intention) => {
                setCurrentIntention(intention);
                setCurrentScreen('checkin');
              }}
              onOpenSettings={() => setShowToneSettings(true)}
              showMemoSaved={showMemoSaved}
              showGoalLockedIn={showGoalLockedIn}
            />
          )}
          {currentScreen === 'create' && (
            <GoalCreationScreen
              onSave={handleCreateIntention}
              onCancel={() => {
                setIdeaToConvert(null);
                setCurrentScreen('home');
              }}
              prefilledTitle={ideaToConvert?.title}
              prefilledVoiceMemo={ideaToConvert?.voiceMemo}
            />
          )}
          {currentScreen === 'checkin' && currentIntention && (
            <CheckInScreen
              intention={currentIntention}
              onCheckIn={handleCheckIn}
              onBack={() => setCurrentScreen('home')}
              onAddMemo={() => setCurrentScreen('add-memo')}
            />
          )}
          {currentScreen === 'reflection' && currentIntention && (
            <ReflectionScreen
              intention={currentIntention}
              onSave={handleReflection}
              onBack={() => setCurrentScreen('checkin')}
            />
          )}
          {currentScreen === 'whatnext' && currentIntention && (
            <WhatNextScreen
              intention={currentIntention}
              onCreateNew={() => setCurrentScreen('create')}
              onGoHome={() => setCurrentScreen('home')}
            />
          )}
          {currentScreen === 'log' && (
            <ReflectionLogScreen
              intentions={intentions}
              onBack={() => setCurrentScreen('home')}
              onGenerateInsights={handleGenerateGoalInsights}
            />
          )}
          {currentScreen === 'insights-generator' && (
            <InsightsGeneratorScreen
              onSave={handleSaveInsights}
              onBack={() => setCurrentScreen('log')}
            />
          )}
          {currentScreen === 'tools' && (
            <ToolsScreen
              showInsightsAdded={showInsightsAdded}
              showIdeasAdded={showIdeasAdded}
              onBack={() => setCurrentScreen('home')}
              onViewIdeas={() => setCurrentScreen('ideas-list')}
              onViewInsights={() => setCurrentScreen('insights-list')}
              onViewVault={() => setCurrentScreen('vault')}
            />
          )}
          {currentScreen === 'insights-list' && (
            <InsightsListScreen
              insights={savedInsights}
              onBack={() => setCurrentScreen('tools')}
              onSelectInsight={(insight) => {
                setCurrentInsight(insight);
                setCurrentScreen('insight-detail');
              }}
            />
          )}
          {currentScreen === 'insight-detail' && currentInsight && (
            <InsightDetailScreen
              insight={currentInsight}
              onBack={() => setCurrentScreen('insights-list')}
            />
          )}
          {currentScreen === 'ideas-list' && (
            <IdeasListScreen
              ideas={ideas}
              onBack={() => setCurrentScreen('tools')}
              onAddNew={() => setCurrentScreen('add-idea')}
              onSelectIdea={(idea) => {
                setCurrentIdea(idea);
                setCurrentScreen('idea-detail');
              }}
              onArchiveIdea={handleArchiveIdea}
              onDeleteIdea={handleDeleteIdea}
            />
          )}
          {currentScreen === 'add-idea' && (
            <AddIdeaScreen
              onSave={handleSaveIdea}
              onBack={() => setCurrentScreen('ideas-list')}
            />
          )}
          {currentScreen === 'idea-detail' && currentIdea && (
            <IdeaDetailScreen
              idea={currentIdea}
              onBack={() => setCurrentScreen('ideas-list')}
              onMakeGoal={handleMakeGoal}
              onUpdateNotification={handleUpdateIdeaNotification}
            />
          )}
          {currentScreen === 'vault' && (
            <VaultScreen
              archivedIdeas={archivedIdeas}
              onBack={() => setCurrentScreen('tools')}
              onSelectIdea={(idea) => {
                setCurrentIdea(idea);
                setCurrentScreen('archived-idea-detail');
              }}
            />
          )}
          {currentScreen === 'archived-idea-detail' && currentIdea && (
            <ArchivedIdeaDetailScreen
              idea={currentIdea}
              onBack={() => setCurrentScreen('vault')}
            />
          )}
          {currentScreen === 'confirmation' && currentIntention && (
            <ConfirmationScreen
              intention={currentIntention}
              onConfirm={handleConfirmation}
              onBack={() => setCurrentScreen('checkin')}
            />
          )}
          {currentScreen === 'add-memo' && currentIntention && (
            <AddMemoScreen
              intention={currentIntention}
              onSave={handleAddMemo}
              onBack={() => setCurrentScreen('checkin')}
            />
          )}
          {currentScreen === 'micro-buttons' && (
            <MicroButtonsScreen
              onBack={() => setCurrentScreen('create')}
              onComplete={handleMicroButtonsComplete}
            />
          )}
          {currentScreen === 'contract' && pendingIntention && (
            <ContractScreen
              goalTitle={pendingIntention.text}
              whyItMatters={pendingIntention.aiSummary || pendingIntention.textMemo || 'Building toward my future self'}
              dueDate={pendingIntention.dueDate}
              onBack={() => setCurrentScreen('micro-buttons')}
              onConfirm={handleContractConfirm}
            />
          )}
        </div>
      </div>

      {/* Tone Settings Sheet */}
      <ToneSettingsSheet
        open={showToneSettings}
        onOpenChange={setShowToneSettings}
        currentTone={userTone}
        onToneChange={handleToneChange}
      />
    </div>
  );
}