
"use strict";

const chat = document.getElementById("chat");
const welcome = document.getElementById("welcome");
const form = document.getElementById("chat-form");
const input = document.getElementById("message");
const sendButton = document.getElementById("send");
const voiceButton = document.getElementById("voice");
const statusText = document.getElementById("status");
const typing = document.getElementById("typing");

let messages = [];
let isWaiting = false;

function addMessage(role, content) {
  if (!chat) {
    console.error("VEDAI: chat element not found");
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;

  const bubble = document.createElement("div");
  bubble.className = "message-content";
  bubble.textContent = content;

  wrapper.appendChild(bubble);
  chat.appendChild(wrapper);
  chat.scrollTop = chat.scrollHeight;
}

async function checkConnection() {
  try {
    const response = await fetch("/api/health");
    if (!response.ok) throw new Error("Health check failed");

    
const raw = await response.text();

let data;
try {
  data = JSON.parse(raw);
} catch (error) {
  console.error("VEDAI returned invalid JSON:", raw);
  throw new Error(
    raw
      ? "Server ne valid JSON nahi bheja."
      : "Server ne empty response bheja."
  );
}


    if (statusText) {
      statusText.textContent = data.modelAvailable
        ? `Connected · ${data.model}`
        : "AI model unavailable";
    }

    console.log("VEDAI health check:", data);
  } catch (error) {
    if (statusText) statusText.textContent = "AI offline";
    console.error("VEDAI connection error:", error);
  }
}

async function sendMessage(text) {
  const message = String(text || "").trim();

  if (!message || isWaiting) return;

  if (!form || !input || !chat) {
    console.error("VEDAI: A required HTML element is missing.");
    return;
  }

  if (welcome) welcome.remove();

  input.value = "";
  addMessage("user", message);
  messages.push({ role: "user", content: message });

  isWaiting = true;
  if (sendButton) sendButton.disabled = true;
  if (typing) typing.classList.remove("hidden");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: messages.slice(-20) })
    });

    
const raw = await response.text();

let data;
try {
  data = JSON.parse(raw);
} catch (error) {
  const preview = raw.slice(0, 180).replace(/\s+/g, " ");
  throw new Error(
    `Chat API returned non-JSON (HTTP ${response.status}). Response: ${preview || "empty"}`
  );
}

if (!response.ok) {
  throw new Error(data.error || `Server error: ${response.status}`);
}

    const reply = data.reply || data.message || data.response;

    if (typeof reply !== "string" || !reply.trim()) {
      throw new Error("AI returned an empty response.");
    }

    messages.push({ role: "assistant", content: reply });
    addMessage("assistant", reply);
  } catch (error) {
    console.error("VEDAI chat error:", error);
    addMessage(
      "assistant",
      `Sorry bhai, reply nahi aa paya.\n${error.message}\nPlease check the VEDAI server and Ollama.`
    );
  } finally {
    isWaiting = false;
    if (sendButton) sendButton.disabled = false;
    if (typing) typing.classList.add("hidden");
    input.focus();
  }
}

if (form && input) {
  form.addEventListener("submit", event => {
    event.preventDefault();
    sendMessage(input.value);
  });

  input.addEventListener("keydown", event => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.isComposing
    ) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
} else {
  console.error("VEDAI: chat-form or message input not found.");
}

document.querySelectorAll(".suggestion").forEach(button => {
  button.addEventListener("click", () => {
    const prompt = button.dataset.prompt;
    if (prompt) sendMessage(prompt);
  });
});

const newChatButton = document.getElementById("new-chat");

if (newChatButton) {
  newChatButton.addEventListener("click", () => {
    if (isWaiting) return;

    messages = [];
    if (chat) chat.innerHTML = "";
    if (welcome) welcome.style.display = "";
    if (input) input.focus();
  });
}

if (voiceButton) {
  const SpeechAPI =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechAPI) {
    const recognition = new SpeechAPI();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = event => {
      if (input) {
        input.value = event.results[0][0].transcript;
        input.focus();
      }
    };

    recognition.onerror = event => {
      console.warn("VEDAI voice input error:", event.error);
    };

    voiceButton.addEventListener("click", () => {
      try {
        recognition.start();
      } catch (error) {
        console.warn("Voice input could not start:", error);
      }
    });
  } else {
    voiceButton.addEventListener("click", () => {
      addMessage(
        "assistant",
        "Bhai, voice input is not supported in this browser. Please type your message."
      );
    });
  }
}

console.log("VEDAI script loaded successfully.");
checkConnection();
