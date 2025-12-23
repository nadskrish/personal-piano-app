/**
 * Test setup for Vitest
 */

import '@testing-library/jest-dom';

// Mock performance.now for testing
if (typeof performance === 'undefined') {
  global.performance = {
    now: () => Date.now(),
  };
}

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => {
  return setTimeout(() => callback(performance.now()), 16);
};

global.cancelAnimationFrame = (id) => {
  clearTimeout(id);
};

// Mock AudioContext
class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.destination = {};
    this.currentTime = 0;
  }

  createOscillator() {
    return {
      type: 'sine',
      frequency: { value: 440, setValueAtTime: () => {} },
      connect: () => {},
      start: () => {},
      stop: () => {},
    };
  }

  createGain() {
    return {
      gain: {
        value: 1,
        setValueAtTime: () => {},
        linearRampToValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
        cancelScheduledValues: () => {},
      },
      connect: () => {},
    };
  }

  resume() {
    this.state = 'running';
    return Promise.resolve();
  }

  close() {
    return Promise.resolve();
  }
}

global.AudioContext = MockAudioContext;
global.webkitAudioContext = MockAudioContext;
