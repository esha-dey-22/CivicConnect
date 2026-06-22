"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X, Bot, User, Mic, Image as ImageIcon } from "lucide-react";

export default function CustomChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your CivicConnect AI assistant. How can I help you today?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Voice Recording Logic
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support voice input.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + (prev ? " " : "") + transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
    };

    recognition.start();
  };

  // Image Upload Logic
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMsg = input.trim();
    const hasImage = !!selectedImage;
    const currentImage = selectedImage; // save current image reference

    setInput("");
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    setMessages((prev) => [
      ...prev, 
      { id: Date.now(), text: userMsg, image: currentImage, sender: "user" }
    ]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, has_image: hasImage }),
      });
      const data = await response.json();
      
      setMessages((prev) => [
        ...prev, 
        { id: Date.now() + 1, text: data.response || data.reply || "I'm here to help!", sender: "bot" }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev, 
        { id: Date.now() + 1, text: "I'm having trouble connecting. Please try again later.", sender: "bot" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 flex h-[500px] w-[380px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-none">Civic AI</h3>
                <span className="text-[10px] opacity-80">Always Online</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="rounded-lg p-1 hover:bg-white/10 transition">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex max-w-[85%] items-start gap-2 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] ${msg.sender === "user" ? "bg-sky-500" : "bg-white/10 border border-white/5"}`}>
                    {msg.sender === "user" ? <User size={12} /> : <Bot size={12} />}
                  </div>
                  <div className={`rounded-2xl px-4 py-2.5 text-sm ${
                    msg.sender === "user" 
                      ? "bg-sky-600 text-white" 
                      : "bg-white/5 text-slate-200 border border-white/10"
                  }`}>
                    {msg.image && (
                      <img src={msg.image} alt="User Upload" className="mb-2 max-w-full rounded-lg border border-white/10 object-cover" />
                    )}
                    {msg.text && <div>{msg.text}</div>}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-4 py-2.5">
                  <div className="flex gap-1">
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-500" />
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-500 [animation-delay:0.2s]" />
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-500 [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="border-t border-white/10 bg-white/[0.02] p-3 flex flex-col gap-2">
            {selectedImage && (
              <div className="relative inline-block w-fit">
                <img src={selectedImage} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-white/10" />
                <button
                  type="button"
                  onClick={() => { setSelectedImage(null); if(fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-0.5 shadow-md"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            <div className="relative flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageSelect}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
              >
                <ImageIcon size={20} />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500/50"
              />
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`rounded-lg p-2 transition ${isRecording ? "text-rose-500 animate-pulse bg-rose-500/10" : "text-slate-400 hover:bg-white/10 hover:text-white"}`}
              >
                <Mic size={20} />
              </button>
              <button
                type="submit"
                disabled={(!input.trim() && !selectedImage) || isLoading}
                className="rounded-lg p-2 text-sky-500 hover:bg-sky-500/10 disabled:opacity-30 transition"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-600 text-white shadow-lg transition-all hover:scale-110 hover:bg-sky-500 active:scale-95"
        >
          <MessageSquare size={28} />
          <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-red-500 border-2 border-slate-950 animate-pulse" />
        </button>
      )}
    </div>
  );
}
