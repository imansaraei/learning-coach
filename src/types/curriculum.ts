export interface StaticCoreLesson {
  headline: string;
  concept: string; // Persian explanation of mental model
  diagramSteps?: { label: string; description: string; icon?: string }[];
  keyTakeaway: string;
}

export interface InteractivePrompt {
  question: string;
  placeholder: string;
  stateTargetKey: string;
  contextHint?: string;
}

export interface ModuleData {
  id: number;
  title: string;
  frameworkStep: string;
  estimatedMinutes: number;
  staticCoreLesson: StaticCoreLesson;
  interactivePrompt: InteractivePrompt;
}

export interface BookCurriculum {
  id: string;
  titleFa: string;
  titleEn: string;
  authorFa: string;
  authorEn: string;
  taglineFa: string;
  frameworkNameFa: string;
  accentColor: string; // Tailwind gradient / color
  iconName: string;
  partTitleFa: string;
  initialUserState: Record<string, any>;
  modules: ModuleData[];
}

export interface DynamicCoachingResult {
  coaching_response: string;
  next_question: string;
  updated_user_state: Record<string, any>;
  is_final_blueprint?: boolean;
}

export interface BlueprintArtifact {
  bookTitle: string;
  frameworkName: string;
  userGoalOrContext: string;
  oldPattern: string;
  newRedesignedSystem: string;
  experiment48Hour: string;
  keyLeversOrRules: string[];
  generatedAt: string;
}
