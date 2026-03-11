// ═══════════════════════════════════════════════════
// DEXI'S NAILS — Chat Asistente IA (chat.js)
// Llama a la Netlify Function (proxy seguro)
// ═══════════════════════════════════════════════════

let chatHistory = [];
let chatOpen = false;
let chatBusy = false;

function toggleChat() {
  const win = document.getElementById('chatWindow');
  chatOpen = !chatOpen;
  if (chatOpen) {
    win.classList.add('open');
    if (chatHistory.length === 0) chatWelcome();
    setTimeout(() => document.getElementById('chatInput').focus(), 200);
  } else {
    win.classList.remove('open');
  }
}

function chatWelcome() {
  const nombre = (typeof clienteActual !== 'undefined' && clienteActual)
    ? clienteActual.nombre.split(' ')[0] : null;
  const msg = nombre
    ? `¡Hola ${nombre}! 💅 Soy Dexi IA, tu asistente. ¿En qué te puedo ayudar hoy?`
    : `¡Hola! ✨ Soy Dexi IA, la asistente de Dexi's Nails. Preguntame sobre servicios, precios u horarios 💅`;
  chatAddMsg('bot', msg);
}

function chatAddMsg(role, text) {
  const messages = document.getElementById('chatMessages');
  const now = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  const div = document.createElement('div');
  div.className = 'chat-msg ' + role;
  div.innerHTML = '<div class="chat-bubble">' + escapeHtml(text) + '</div><div class="chat-time">' + now + '</div>';
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function chatShowTyping() {
  const messages = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'chat-msg bot'; div.id = 'chatTyping';
  div.innerHTML = '<div class="chat-typing"><span></span><span></span><span></span></div>';
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function chatHideTyping() {
  const el = document.getElementById('chatTyping');
  if (el) el.remove();
}

function chatKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); chatSend(); }
}

async function chatSend() {
  if (chatBusy) return;
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;
  input.value = ''; input.style.height = 'auto';
  chatAddMsg('user', text);
  chatHistory.push({ role: 'user', content: text });
  chatBusy = true;
  document.getElementById('chatSendBtn').disabled = true;
  chatShowTyping();
  try {
    const clienteNombre = (typeof clienteActual !== 'undefined' && clienteActual) ? clienteActual.nombre : null;
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chatHistory.slice(-12), clienteNombre })
    });
    const data = await response.json();
    chatHideTyping();
    if (data.reply) {
      chatAddMsg('bot', data.reply);
      chatHistory.push({ role: 'assistant', content: data.reply });
      if (data.escalado) {
        setTimeout(() => chatAddMsg('bot', '📱 Le avisé a Dexi — te va a contactar pronto.'), 800);
      }
      if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
    } else {
      chatAddMsg('bot', 'Ups, algo salió mal 🙏 Intentá de nuevo.');
    }
  } catch (err) {
    chatHideTyping();
    chatAddMsg('bot', 'No me pude conectar 💫 Intentá de nuevo.');
    console.error('Chat error:', err);
  }
  chatBusy = false;
  document.getElementById('chatSendBtn').disabled = false;
  document.getElementById('chatInput').focus();
}

function escapeHtml(t) {
  return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
}

function chatOnLogin(cliente) {
  const nombre = cliente.nombre.split(' ')[0];
  if (chatHistory.length > 0) {
    const msg = '¡Hola ' + nombre + '! 💅 Ya te reconozco. ¿En qué te puedo ayudar?';
    chatAddMsg('bot', msg);
    chatHistory.push({ role: 'assistant', content: msg });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('chatInput');
  if (input) {
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 100) + 'px';
    });
  }
});
