const OPENAI_API_KEY = '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';

const voiceBtn = document.getElementById('voice-btn');
const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const statusMessage = document.getElementById('status-message');
const messagesContainer = document.getElementById('messages-container');
const aiVisual = document.getElementById('ai-visual');
const chatModal = document.getElementById('chat-modal');
const alertModal = document.getElementById('alert-modal');
const alertMessage = document.getElementById('alert-message');
const closeAlertBtn = document.getElementById('close-alert');
const clockDiv = document.getElementById('clock');
const dateDiv = document.getElementById('date');

let isListening = false;
let recognition;
let isChatOpen = false;

const websites = {
    'google': 'https://www.google.com',
    'youtube': 'https://www.youtube.com',
    'github': 'https://www.github.com',
    'facebook': 'https://www.facebook.com'
};

const updateClock = () => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour12: false });
    const date = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    clockDiv.textContent = time;
    dateDiv.textContent = date;
};

setInterval(updateClock, 1000);
updateClock();

const showMessage = (msg) => {
    alertMessage.textContent = msg;
    alertModal.classList.remove('hidden');
};

closeAlertBtn.addEventListener('click', () => {
    alertModal.classList.add('hidden');
});

const toggleChat = () => {
    isChatOpen = !isChatOpen;
    if (isChatOpen) {
        aiVisual.style.display = 'none';
        chatModal.classList.remove('hidden');
        chatModal.style.display = 'flex';
        statusMessage.style.display = 'none';
    } else {
        aiVisual.style.display = 'flex';
        chatModal.classList.add('hidden');
        chatModal.style.display = 'none';
        statusMessage.style.display = 'block';
    }
};

const addMessageToChat = (text, sender) => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `p-3 rounded-xl max-w-[80%] ${sender === 'user' ? 'bg-blue-600 ml-auto' : 'bg-gray-700 mr-auto'}`;
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    if (!isChatOpen) {
        toggleChat();
    }
};

const handleWebsiteCommand = (command) => {
    const openCommand = 'kholo'; // 'kholo' for 'open'
    const jervisCommand = 'Jervis'; // 'Jervis' for the assistant's name

    let lowerCaseCommand = command.toLowerCase();

    if (lowerCaseCommand.includes(jervisCommand.toLowerCase())) {
        lowerCaseCommand = lowerCaseCommand.replace(jervisCommand.toLowerCase(), '').trim();
    }

    if (lowerCaseCommand.includes(openCommand)) {
        for (const siteName in websites) {
            if (lowerCaseCommand.includes(siteName.toLowerCase())) {
                const url = websites[siteName];
                addMessageToChat(`${siteName} website khol raha hoon...`, 'assistant');
                setTimeout(() => {
                    window.open(url, '_blank');
                }, 1000);
                return true;
            }
        }
    }
    return false;
};

const callOpenAIAPI = async (prompt) => {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 150
            })
        });

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
            const assistantText = data.choices[0].message.content.trim();
            addMessageToChat(assistantText, 'assistant');
        } else {
            addMessageToChat("Mujhe koi jawab nahi mila.", 'assistant');
        }
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        showMessage("OpenAI API ko call karte samay ek truti hui.");
        addMessageToChat("Maaf karen, ek truti hui.", 'assistant');
    }
};

// --- Speech Recognition setup ---
if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'hi-IN'; // Hindi language

    recognition.onstart = () => {
        isListening = true;
        statusMessage.textContent = "Sun raha hoon...";
        aiVisual.classList.add('animate-pulse');
        voiceBtn.classList.add('bg-red-600');
        voiceBtn.classList.remove('bg-green-600');
    };

    recognition.onend = () => {
        isListening = false;
        statusMessage.textContent = "Voice command taiyar hai";
        aiVisual.classList.remove('animate-pulse');
        voiceBtn.classList.remove('bg-red-600');
        voiceBtn.classList.add('bg-green-600');
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        addMessageToChat(transcript, 'user');
        const commandHandled = handleWebsiteCommand(transcript);
        if (!commandHandled) {
            callOpenAIAPI(transcript);
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        showMessage("Speech recognition mein ek truti hui.");
    };

    voiceBtn.addEventListener('click', () => {
        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });
} else {
    voiceBtn.style.display = 'none';
    showMessage("Aapka browser speech recognition ka samarthan nahi karta. Kripaya Google Chrome ka upayog karen.");
}

// --- Form Submission ---
sendBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (text) {
        addMessageToChat(text, 'user');
        const commandHandled = handleWebsiteCommand(text);
        if (!commandHandled) {
            callOpenAIAPI(text);
        }
        userInput.value = '';
    }
});
