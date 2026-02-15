import { soundSystem } from '../game/sound';

// Mock AudioContext
const mockOscillator = {
  connect: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  frequency: { value: 0, setValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() },
  type: 'sine',
};

const mockGain = {
  connect: jest.fn(),
  gain: { 
    value: 0, 
    setValueAtTime: jest.fn(),
    exponentialRampToValueAtTime: jest.fn(),
    exponentialDecayTo: jest.fn(),
  },
};

const mockAudioContext = {
  currentTime: 0,
  state: 'running',
  resume: jest.fn().mockResolvedValue(undefined),
  createOscillator: jest.fn(() => mockOscillator),
  createGain: jest.fn(() => mockGain),
  destination: {},
};

// @ts-expect-error - Mocking global AudioContext for tests
global.AudioContext = jest.fn(() => mockAudioContext);
// @ts-expect-error - Mocking global window for tests
global.window = { AudioContext: jest.fn(() => mockAudioContext) };

describe('SoundSystem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    soundSystem.setEnabled(true);
    soundSystem.setVolume(0.3);
  });

  test('should be enabled by default', () => {
    expect(soundSystem.isEnabled()).toBe(true);
  });

  test('should allow enabling/disabling', () => {
    soundSystem.setEnabled(false);
    expect(soundSystem.isEnabled()).toBe(false);
    soundSystem.setEnabled(true);
    expect(soundSystem.isEnabled()).toBe(true);
  });

  test('should clamp volume between 0 and 1', () => {
    soundSystem.setVolume(1.5);
    expect(soundSystem.getVolume()).toBe(1);
    soundSystem.setVolume(-0.5);
    expect(soundSystem.getVolume()).toBe(0);
    soundSystem.setVolume(0.5);
    expect(soundSystem.getVolume()).toBe(0.5);
  });

  test('should not play when disabled', () => {
    soundSystem.setEnabled(false);
    soundSystem.play('patientCured');
    expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
  });

  test('should create oscillator for patientCured sound', () => {
    soundSystem.play('patientCured');
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockOscillator.connect).toHaveBeenCalled();
    expect(mockOscillator.start).toHaveBeenCalled();
  });

  test('should create oscillator for patientDeath sound', () => {
    soundSystem.play('patientDeath');
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
  });

  test('should create oscillator for roomBuilt sound', () => {
    soundSystem.play('roomBuilt');
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
  });

  test('should create oscillator for staffHired sound', () => {
    soundSystem.play('staffHired');
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
  });

  test('should create oscillator for cashReceived sound', () => {
    soundSystem.play('cashReceived');
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
  });

  test('should create oscillator for patientArriving sound', () => {
    soundSystem.play('patientArriving');
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
  });

  test('should create oscillator for lowCash sound', () => {
    soundSystem.play('lowCash');
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
  });

  test('should create oscillator for gameWon sound', () => {
    soundSystem.play('gameWon');
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
  });

  test('should create oscillator for gameLost sound', () => {
    soundSystem.play('gameLost');
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
  });
});
