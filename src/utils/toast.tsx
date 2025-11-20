import toast from 'react-hot-toast';

// Onboarding messages that show on first visit
const onboardingMessages = [
  {
    message: '🚀 Welcome to SkyHigh Cosmos Explorer!',
    delay: 500,
  },
  {
    message: '🖱️ Use your mouse to orbit and zoom around the solar system',
    delay: 3000,
  },
  {
    message: '🪐 Click any planet or the Sun to focus and follow it',
    delay: 6500,
  },
  {
    message: '⌨️ Press L to toggle the Layers panel and customize your view',
    delay: 10000,
  },
  {
    message: '📊 Press I to view astronomical events and alerts',
    delay: 13500,
  },
];

// Show onboarding sequence
export const showOnboarding = () => {
  // Check if user has seen onboarding before
  const hasSeenOnboarding = localStorage.getItem('skyhigh-onboarding-seen');
  
  if (!hasSeenOnboarding) {
    onboardingMessages.forEach(({ message, delay }) => {
      setTimeout(() => {
        toast(message, {
          icon: '✨',
          duration: 3000,
        });
      }, delay);
    });
    
    // Mark onboarding as seen
    localStorage.setItem('skyhigh-onboarding-seen', 'true');
  }
};

// Utility toast functions
export const toastInfo = (message: string) => {
  toast(message, {
    icon: 'ℹ️',
  });
};

export const toastSuccess = (message: string) => {
  toast.success(message);
};

export const toastError = (message: string) => {
  toast.error(message);
};

export const toastEvent = (title: string, description?: string) => {
  toast(
    (t) => (
      <div className="flex flex-col gap-1">
        <div className="font-semibold">{title}</div>
        {description && <div className="text-sm text-white/70">{description}</div>}
      </div>
    ),
    {
      icon: '🌟',
      duration: 5000,
    }
  );
};

export const toastSolarEvent = (event: string) => {
  toast(
    `☀️ Solar Event: ${event}`,
    {
      duration: 6000,
      style: {
        background: 'rgba(251, 146, 60, 0.2)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(251, 146, 60, 0.3)',
      },
    }
  );
};

export const toastMeteorShower = (name: string) => {
  toast(
    `☄️ Meteor Shower Alert: ${name}`,
    {
      duration: 6000,
      style: {
        background: 'rgba(59, 130, 246, 0.2)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
      },
    }
  );
};
