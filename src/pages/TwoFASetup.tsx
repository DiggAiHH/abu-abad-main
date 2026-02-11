import React from 'react';

interface TwoFASetupProps {
  onSetupComplete: () => void;
}

const TwoFASetup: React.FC<TwoFASetupProps> = ({ onSetupComplete }) => {
  return (
    <div>
      <h1>Two-Factor Authentication Setup</h1>
      <p>Follow the instructions to set up Two-Factor Authentication.</p>
      <button onClick={onSetupComplete}>Complete Setup</button>
    </div>
  );
};

export default TwoFASetup;