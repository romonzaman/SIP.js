/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-console */
import { SimpleUser, SimpleUserDelegate, SimpleUserOptions } from "../src/platform/web";
import { getAudio, getButton, getButtons, getInput, getSpan } from "./demo-utils";

const serverSpan = getSpan("server");
const targetSpan = getSpan("target");
const connectButton = getButton("connect");
const registerButton = getButton("register");
const unregisterButton = getButton("unregister");
const callButton = getButton("call");
const hangupButton = getButton("hangup");
const disconnectButton = getButton("disconnect");
const audioElement = getAudio("remoteAudio");
const keypad = getButtons("keypad");
const dtmfSpan = getSpan("dtmf");
const holdCheckbox = getInput("hold");
const muteCheckbox = getInput("mute");

let simpleUser: SimpleUser;

// WebSocket Server URL
const webSocketServer = "wss://domain.com7443";
serverSpan.innerHTML = webSocketServer;

// Destination URI
const target = "sip:*97@domain.com";
targetSpan.innerHTML = target;

const aor = "sip:username@domain.com";
const aor_password= "username";
const aor_username = "password";

// Name for demo user
const displayName = "lawhq";

// SimpleUser delegate
const simpleUserDelegate: SimpleUserDelegate = {
  onCallCreated: (): void => {
    console.log(`[${displayName}] Call created`);
    callButton.disabled = true;
    hangupButton.disabled = false;
    keypadDisabled(true);
    holdCheckboxDisabled(true);
    muteCheckboxDisabled(true);
  },
  onRegistered: ():void => {
    console.log(`[${displayName}] User Registered`);
    registerButton.disabled = true;
    unregisterButton.disabled = false;
    callButton.disabled = false;
  },
  onUnregistered: ():void => {
    console.log(`[${displayName}] User UnRegistered`);
    registerButton.disabled = false;
    unregisterButton.disabled = true;
    callButton.disabled = true;
  },  
  onCallAnswered: (): void => {
    console.log(`[${displayName}] Call answered`);
    keypadDisabled(false);
    holdCheckboxDisabled(false);
    muteCheckboxDisabled(false);
    
    // user.answer().catch((error: Error) => {
    //   console.error(`[${user.id}] failed to answer call`);
    //   console.error(error);
    //   alert(`[${user.id}] Failed to answer call.\n` + error);
    // });    
  },
  onCallHangup: (): void => {
    console.log(`[${displayName}] Call hangup`);
    callButton.disabled = false;
    hangupButton.disabled = true;
    keypadDisabled(true);
    holdCheckboxDisabled(true);
    muteCheckboxDisabled(true);
  },
  onCallHold: (held: boolean): void => {
    console.log(`[${displayName}] Call hold ${held}`);
    holdCheckbox.checked = held;
  },
  onCallReceived: async () => {
    console.log(`[${displayName}] Incoming Call!`);
    await simpleUser.answer();
  }
};



// SimpleUser options
const simpleUserOptions: SimpleUserOptions = {
  aor,
  delegate: simpleUserDelegate,
  media: {
    remote: {
      audio: audioElement
    }
  },
  userAgentOptions: {
    displayName,
    authorizationPassword: aor_password,
    authorizationUsername: aor_username  
  }
};

// SimpleUser construction
simpleUser = new SimpleUser(webSocketServer, simpleUserOptions);

// Add click listener to connect button
connectButton.addEventListener("click", () => {
  // alert("test");
  connectButton.disabled = true;
  disconnectButton.disabled = true;
  registerButton.disabled = true;
  callButton.disabled = true;
  hangupButton.disabled = true;
  simpleUser
    .connect()
    .then(() => {
      connectButton.disabled = true;
      disconnectButton.disabled = false;
      registerButton.disabled = false;
      callButton.disabled = true;
      hangupButton.disabled = true;
    })
    .catch((error: Error) => {
      connectButton.disabled = false;
      console.error(`[${simpleUser.id}] failed to connect`);
      console.error(error);
      alert("Failed to connect.\n" + error);
    });
});

registerButton.addEventListener("click", () => {
  registerButton.disabled = true;
  simpleUser
    .register()
    .then(() => {
      registerButton.disabled = true;
    })
    .catch((error: Error) => {
      registerButton.disabled = false;
      console.error(`[${simpleUser.id}] failed to connect`);
      console.error(error);
      alert("Failed to connect.\n" + error);
    });
});
unregisterButton.addEventListener("click", () => {
  registerButton.disabled = true;
  simpleUser
    .unregister()
    .then(() => {
      registerButton.disabled = true;
    })
    .catch((error: Error) => {
      registerButton.disabled = false;
      console.error(`[${simpleUser.id}] failed to connect`);
      console.error(error);
      alert("Failed to connect.\n" + error);
    });
});
// Add click listener to call button
callButton.addEventListener("click", () => {
  callButton.disabled = true;
  hangupButton.disabled = true;
  simpleUser.call(target).catch((error: Error) => {
    console.error(`[${simpleUser.id}] failed to place call`);
    console.error(error);
    alert("Failed to place call.\n" + error);
  });
});

// Add click listener to hangup button
hangupButton.addEventListener("click", () => {
  callButton.disabled = true;
  hangupButton.disabled = true;
  simpleUser.hangup().catch((error: Error) => {
    console.error(`[${simpleUser.id}] failed to hangup call`);
    console.error(error);
    alert("Failed to hangup call.\n" + error);
  });
});

// Add click listener to disconnect button
disconnectButton.addEventListener("click", () => {
  connectButton.disabled = true;
  disconnectButton.disabled = true;
  callButton.disabled = true;
  hangupButton.disabled = true;
  simpleUser
    .disconnect()
    .then(() => {
      connectButton.disabled = false;
      registerButton.disabled = true;      
      disconnectButton.disabled = true;
      callButton.disabled = true;
      hangupButton.disabled = true;
    })
    .catch((error: Error) => {
      console.error(`[${simpleUser.id}] failed to disconnect`);
      console.error(error);
      alert("Failed to disconnect.\n" + error);
    });
});

// Add click listeners to keypad buttons
keypad.forEach((button) => {
  button.addEventListener("click", () => {
    const tone = button.textContent;
    if (tone) {
      simpleUser.sendDTMF(tone).then(() => {
        dtmfSpan.innerHTML += tone;
      });
    }
  });
});

// Keypad helper function
const keypadDisabled = (disabled: boolean): void => {
  keypad.forEach((button) => (button.disabled = disabled));
  dtmfSpan.innerHTML = "";
};

// Add change listener to hold checkbox
holdCheckbox.addEventListener("change", () => {
  if (holdCheckbox.checked) {
    // Checkbox is checked..
    simpleUser.hold().catch((error: Error) => {
      holdCheckbox.checked = false;
      console.error(`[${simpleUser.id}] failed to hold call`);
      console.error(error);
      alert("Failed to hold call.\n" + error);
    });
  } else {
    // Checkbox is not checked..
    simpleUser.unhold().catch((error: Error) => {
      holdCheckbox.checked = true;
      console.error(`[${simpleUser.id}] failed to unhold call`);
      console.error(error);
      alert("Failed to unhold call.\n" + error);
    });
  }
});

// Hold helper function
const holdCheckboxDisabled = (disabled: boolean): void => {
  holdCheckbox.checked = false;
  holdCheckbox.disabled = disabled;
};

// Add change listener to mute checkbox
muteCheckbox.addEventListener("change", () => {
  if (muteCheckbox.checked) {
    // Checkbox is checked..
    simpleUser.mute();
    if (simpleUser.isMuted() === false) {
      muteCheckbox.checked = false;
      console.error(`[${simpleUser.id}] failed to mute call`);
      alert("Failed to mute call.\n");
    }
  } else {
    // Checkbox is not checked..
    simpleUser.unmute();
    if (simpleUser.isMuted() === true) {
      muteCheckbox.checked = true;
      console.error(`[${simpleUser.id}] failed to unmute call`);
      alert("Failed to unmute call.\n");
    }
  }
});

// Mute helper function
const muteCheckboxDisabled = (disabled: boolean): void => {
  muteCheckbox.checked = false;
  muteCheckbox.disabled = disabled;
};

// Enable the connect button
connectButton.disabled = false;
