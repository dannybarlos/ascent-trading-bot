import React from 'react';

const SimpleTest: React.FC = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', margin: '20px' }}>
      <h1>Simple Test Component</h1>
      <p>If you can see this, React is rendering properly.</p>
      <button onClick={() => alert('Button works!')}>
        Test Button
      </button>
    </div>
  );
};

export default SimpleTest;