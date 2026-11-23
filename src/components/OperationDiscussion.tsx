import React, { useState, useRef, useEffect } from "react";
import type { OperationMessage } from "@/contexts/DataContext";

interface OperationDiscussionProps {
  messages: OperationMessage[];
  onSend: (text: string) => { success: boolean; error?: string };
  authorLabel: string;
  formatDate: (iso: string) => string;
}

export const OperationDiscussion: React.FC<OperationDiscussionProps> = ({
  messages,
  onSend,
  authorLabel,
  formatDate,
}) => {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmedText = text.trim();

    if (!trimmedText) {
      return;
    }

    const result = onSend(trimmedText);
    
    if (result.success) {
      setText("");
      setError("");
    } else {
      setError(result.error || "Erreur lors de l'envoi");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-xs uppercase tracking-wide font-medium text-gray-500">
          Discussion
        </h3>
      </div>

      <div className="p-6 space-y-4">
        {/* Message list */}
        <div className="max-h-[320px] overflow-y-auto space-y-3">
          {messages.length === 0 ? (
            <div className="text-sm text-gray-400 text-center py-8">
              Aucun message
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div key={msg.id} className="flex gap-3">
                  {/* Avatar circle */}
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {msg.author.charAt(0).toUpperCase()}
                  </div>

                  {/* Message content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {msg.author}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(msg.date)}
                      </span>
                    </div>
                    <div
                      className={`text-sm mt-0.5 whitespace-pre-wrap ${
                        msg.kind === "auto" ? "text-gray-500 italic" : "text-gray-700"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-gray-200 pt-4">
          <div className="mb-2">
            <span className="text-xs text-gray-500">
              Vous écrivez en tant que : <span className="font-medium">{authorLabel}</span>
            </span>
          </div>
          <div className="flex gap-3 mb-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Écrire une note…"
              rows={2}
              className="flex-1 px-3 py-2 rounded border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary resize-none"
            />
            <button
              onClick={handleSend}
              disabled={!text.trim()}
              className={`h-9 px-4 rounded text-sm font-medium transition-colors self-start ${
                text.trim()
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Envoyer
            </button>
          </div>

          {error && (
            <div className="text-xs text-red-600">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
};
