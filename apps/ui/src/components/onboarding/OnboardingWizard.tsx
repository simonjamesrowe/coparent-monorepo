import { useState } from 'react';

import type {
  Family,
  Child,
  Invitation,
  OnboardingState,
  ParentRole,
} from '../../lib/api/client';

type WizardStep = 'account' | 'family' | 'child' | 'invite' | 'review';

type ChildDraft = {
  fullName: string;
  dateOfBirth: string;
  school?: string;
  medicalNotes?: string;
};

const STEPS: { id: WizardStep; label: string; description: string }[] = [
  { id: 'account', label: 'Account', description: 'Create your login' },
  { id: 'family', label: 'Family', description: 'Name your family' },
  { id: 'child', label: 'Children', description: 'Add profiles' },
  { id: 'invite', label: 'Invite', description: 'Bring your co-parent' },
  { id: 'review', label: 'Review', description: 'Confirm setup' },
];

interface OnboardingWizardProps {
  families: Family[];
  children: Child[];
  invitations: Invitation[];
  onboardingStates: OnboardingState[];
  activeFamilyId?: string;
  onCreateAccount?: () => void;
  onCreateFamily?: (name: string, timeZone: string) => void;
  onAddChild?: (child: ChildDraft) => void;
  onInviteCoParent?: (familyId: string, email: string, role: ParentRole) => void;
  onCompleteOnboarding?: (familyId: string) => void;
}

export function OnboardingWizard({
  families,
  children,
  invitations,
  onboardingStates,
  activeFamilyId,
  onCreateAccount,
  onCreateFamily,
  onAddChild,
  onInviteCoParent,
  onCompleteOnboarding,
}: OnboardingWizardProps) {
  const activeOnboarding = onboardingStates.find(
    (state) => state.familyId === activeFamilyId,
  );
  const initialStep = (activeOnboarding?.currentStep as WizardStep) || 'account';

  const [currentStep, setCurrentStep] = useState<WizardStep>(initialStep);
  const [familyName, setFamilyName] = useState('');
  const [timeZone, setTimeZone] = useState('America/New_York');
  const [childName, setChildName] = useState('');
  const [childDob, setChildDob] = useState('');
  const [childSchool, setChildSchool] = useState('');
  const [childMedicalNotes, setChildMedicalNotes] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<ParentRole>('co-parent');
  const [addedChildren, setAddedChildren] = useState<Partial<Child>[]>([]);

  const currentStepIndex = STEPS.findIndex((step) => step.id === currentStep);
  const completedSteps = activeOnboarding?.completedSteps || [];

  const goNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].id);
    }
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id);
    }
  };

  const handleCreateFamily = () => {
    onCreateFamily?.(familyName, timeZone);
    goNext();
  };

  const handleAddChild = () => {
    const newChild: ChildDraft = {
      fullName: childName,
      dateOfBirth: childDob,
      school: childSchool || undefined,
      medicalNotes: childMedicalNotes || undefined,
    };
    onAddChild?.(newChild);
    setAddedChildren([...addedChildren, newChild]);
    setChildName('');
    setChildDob('');
    setChildSchool('');
    setChildMedicalNotes('');
  };

  const handleInvite = () => {
    if (activeFamilyId && inviteEmail) {
      onInviteCoParent?.(activeFamilyId, inviteEmail, inviteRole);
    }
    goNext();
  };

  const handleComplete = () => {
    if (activeFamilyId) {
      onCompleteOnboarding?.(activeFamilyId);
    }
  };

  const activeFamily = families.find((f) => f.id === activeFamilyId);
  const familyChildren = children.filter((c) => c.familyId === activeFamilyId);
  const familyInvitations = invitations.filter((i) => i.familyId === activeFamilyId);
  const pendingInvites = familyInvitations.filter((i) => i.status === 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20">
      {/* Decorative background pattern */}
      <div
        className="fixed inset-0 opacity-[0.015] dark:opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Floating decorative shapes */}
      <div className="fixed top-20 right-10 w-64 h-64 bg-teal-400/10 dark:bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 left-10 w-96 h-96 bg-rose-400/10 dark:bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-xl shadow-teal-500/30 mb-6">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
              />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome to CoParent
          </h1>
          <p className="mt-3 text-lg text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            Let's set up your family in just a few steps
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const isCompleted =
                completedSteps.includes(step.id) || index < currentStepIndex;
              const isCurrent = step.id === currentStep;

              return (
                <div key={step.id} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`
                        relative w-12 h-12 rounded-2xl flex items-center justify-center
                        transition-all duration-300 ease-out
                        ${
                          isCompleted
                            ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                            : isCurrent
                              ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 ring-2 ring-teal-500 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50'
                              : 'bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                      ) : (
                        <span className="text-sm font-bold">{index + 1}</span>
                      )}
                      {isCurrent && (
                        <span className="absolute -inset-1 rounded-2xl bg-teal-500/20 animate-pulse" />
                      )}
                    </div>
                    <div className="mt-3 text-center">
                      <p
                        className={`text-sm font-semibold ${
                          isCurrent
                            ? 'text-teal-600 dark:text-teal-400'
                            : isCompleted
                              ? 'text-slate-700 dark:text-slate-300'
                              : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 hidden sm:block">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 mt-[-24px] rounded-full transition-colors ${
                        isCompleted ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content Card */}
        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-2xl shadow-slate-200/40 dark:shadow-slate-950/50 overflow-hidden">
          {/* Account Step */}
          {currentStep === 'account' && (
            <div className="p-8 sm:p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 dark:bg-teal-500/20 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-teal-600 dark:text-teal-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Create Your Account
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400">
                    Start by setting up your personal login
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Create a secure password"
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition"
                  />
                  <p className="mt-2 text-xs text-slate-400">
                    At least 8 characters with a mix of letters and numbers
                  </p>
                </div>
              </div>

              <div className="mt-10 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onCreateAccount?.();
                    goNext();
                  }}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-0.5 active:translate-y-0"
                >
                  Create Account
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Family Step */}
          {currentStep === 'family' && (
            <div className="p-8 sm:p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-rose-600 dark:text-rose-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Name Your Family
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400">
                    This helps identify your co-parenting unit
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Family Name
                  </label>
                  <input
                    type="text"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    placeholder="e.g., The Kingston Family"
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition"
                  />
                  <p className="mt-2 text-xs text-slate-400">
                    This is visible to both parents in the family
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Time Zone
                  </label>
                  <select
                    value={timeZone}
                    onChange={(e) => setTimeZone(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition appearance-none"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="America/Anchorage">Alaska Time (AKT)</option>
                    <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-200/60 dark:border-teal-800/40">
                  <div className="flex gap-3">
                    <svg
                      className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-teal-800 dark:text-teal-200">
                        Why a family name?
                      </p>
                      <p className="mt-1 text-sm text-teal-700 dark:text-teal-300">
                        The family name appears in your dashboard and helps
                        organize shared schedules, expenses, and documents.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center gap-2 px-6 py-3 text-slate-600 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                    />
                  </svg>
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleCreateFamily}
                  disabled={!familyName.trim()}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/25 disabled:shadow-none transition-all duration-200 hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-0.5 active:translate-y-0 disabled:translate-y-0 disabled:cursor-not-allowed"
                >
                  Continue
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Child Step */}
          {currentStep === 'child' && (
            <div className="p-8 sm:p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-amber-600 dark:text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Add Your Children
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400">
                    Create profiles for each child you're co-parenting
                  </p>
                </div>
              </div>

              {/* Added children list */}
              {(addedChildren.length > 0 || familyChildren.length > 0) && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Children added ({addedChildren.length + familyChildren.length})
                  </p>
                  <div className="space-y-2">
                    {[...familyChildren, ...addedChildren].map((child, index) => (
                      <div
                        key={child.id || index}
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
                          {child.fullName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {child.fullName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Born {child.dateOfBirth}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Child's Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      placeholder="First and last name"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Date of Birth <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={childDob}
                      onChange={(e) => setChildDob(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    School{' '}
                    <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={childSchool}
                    onChange={(e) => setChildSchool(e.target.value)}
                    placeholder="e.g., Willow Creek Elementary"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Medical Notes{' '}
                    <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={childMedicalNotes}
                    onChange={(e) => setChildMedicalNotes(e.target.value)}
                    placeholder="Allergies, medications, or special requirements"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition resize-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddChild}
                  disabled={!childName.trim() || !childDob}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 disabled:bg-slate-200 dark:disabled:bg-slate-700 text-white dark:text-slate-900 disabled:text-slate-400 dark:disabled:text-slate-500 font-medium rounded-xl transition disabled:cursor-not-allowed"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Child
                </button>
              </div>

              <div className="mt-10 flex justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center gap-2 px-6 py-3 text-slate-600 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                    />
                  </svg>
                  Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={addedChildren.length === 0 && familyChildren.length === 0}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/25 disabled:shadow-none transition-all duration-200 hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-0.5 active:translate-y-0 disabled:translate-y-0 disabled:cursor-not-allowed"
                >
                  Continue
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Invite Step */}
          {currentStep === 'invite' && (
            <div className="p-8 sm:p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-violet-600 dark:text-violet-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Invite Your Co-Parent
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400">
                    Send an invitation to collaborate
                  </p>
                </div>
              </div>

              {pendingInvites.length > 0 && (
                <div className="mb-6 p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200/60 dark:border-violet-800/40">
                  <p className="text-sm font-medium text-violet-800 dark:text-violet-200 mb-2">
                    Pending invitations
                  </p>
                  {pendingInvites.map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between py-2">
                      <span className="text-sm text-violet-700 dark:text-violet-300">
                        {invite.email}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-medium">
                        Pending
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Co-Parent Email
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="coparent@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as ParentRole)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition appearance-none"
                  >
                    <option value="co-parent">Co-Parent</option>
                    <option value="primary">Primary</option>
                  </select>
                </div>
              </div>

              <div className="mt-10 flex justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center gap-2 px-6 py-3 text-slate-600 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                    />
                  </svg>
                  Back
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex items-center gap-2 px-6 py-3 text-slate-600 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Skip
                  </button>
                  <button
                    type="button"
                    onClick={handleInvite}
                    disabled={!inviteEmail.trim()}
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/25 disabled:shadow-none transition-all duration-200 hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-0.5 active:translate-y-0 disabled:translate-y-0 disabled:cursor-not-allowed"
                  >
                    Send Invite
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Review Step */}
          {currentStep === 'review' && (
            <div className="p-8 sm:p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Review & Complete
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400">
                    Confirm your setup details
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Family
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300">
                    {activeFamily?.name || familyName || 'Family name pending'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Time Zone: {activeFamily?.timeZone || timeZone}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Children
                  </h3>
                  <div className="space-y-2">
                    {[...familyChildren, ...addedChildren].map((child, index) => (
                      <div key={child.id || index} className="text-slate-700 dark:text-slate-300">
                        {child.fullName}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Invitations
                  </h3>
                  {pendingInvites.length > 0 ? (
                    <div className="space-y-2">
                      {pendingInvites.map((invite) => (
                        <div key={invite.id} className="text-slate-700 dark:text-slate-300">
                          {invite.email} ({invite.role})
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400">
                      No invitations sent
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-10 flex justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center gap-2 px-6 py-3 text-slate-600 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                    />
                  </svg>
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleComplete}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0"
                >
                  Complete Setup
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
