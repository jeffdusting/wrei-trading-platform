import type { RefObject } from 'react';
import type { NegotiationState, PersonaType } from '@/lib/types';
import type { NegotiationScorecard } from '@/lib/negotiation-scoring';
import Scorecard from '@/components/negotiation/Scorecard';

interface ChatInterfaceProps {
  tradingState: NegotiationState | null;
  tradingStarted: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  setError: (s: string | null) => void;
  lastFailedMessage: string | null;
  inputMessage: string;
  setInputMessage: (s: string) => void;
  selectedPersona: PersonaType | 'freeplay';
  showScorecard: boolean;
  setShowScorecard: (b: boolean) => void;
  tradingScorecard: NegotiationScorecard | null;
  setShowProvenanceCert: (b: boolean) => void;
  messagesEndRef: RefObject<HTMLDivElement>;
  inputRef: RefObject<HTMLTextAreaElement>;
  onStartTrading: () => void;
  onSendMessage: (retryMessage?: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onEndTrading: () => void;
  onRequestHuman: () => void;
  onResetTrading: () => void;
}

export default function ChatInterface({
  tradingState,
  tradingStarted,
  isLoading,
  isInitializing,
  error,
  setError,
  lastFailedMessage,
  inputMessage,
  setInputMessage,
  selectedPersona,
  showScorecard, setShowScorecard, tradingScorecard,
  setShowProvenanceCert, messagesEndRef,
  inputRef,
  onStartTrading, onSendMessage, onKeyPress,
  onEndTrading, onRequestHuman, onResetTrading,
}: ChatInterfaceProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex-1 flex flex-col min-h-[60vh] lg:min-h-0" role="main" aria-label="Carbon credit trading chat" data-demo="trading-chat">

      {/* Messages Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4" role="log" aria-live="polite" aria-label="Trading messages">
        {!tradingStarted ? (
          <div className="text-center py-12">
            {isInitializing ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0EA5E9] mx-auto mb-4"></div>
                <h3 className="bloomberg-metric-value text-[#1E293B] mb-2">
                  Connecting to WREI Platform...
                </h3>
                <p className="text-[#64748B]">
                  Initialising AI negotiation agent
                </p>
              </>
            ) : (
              <>
                <h3 className="bloomberg-metric-value text-[#1E293B] mb-4">
                  Ready to Begin Negotiation
                </h3>
                <p className="text-[#64748B] mb-6">
                  Click &quot;Start Negotiation&quot; to begin your WREI carbon credit negotiation session.
                </p>
                <button
                  onClick={onStartTrading}
                  disabled={isLoading}
                  className="bg-[#0EA5E9] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0284C7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Starting...' : 'Start Trading'}
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            {tradingState?.messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'buyer' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'buyer'
                    ? 'bg-[#E2E8F0] text-[#1E293B]'
                    : 'bg-[#0EA5E9] text-white'
                }`}>
                  <div className="bloomberg-small-text md:bloomberg-body-text whitespace-pre-wrap prose prose-sm max-w-none"
                       dangerouslySetInnerHTML={{
                         __html: message.content
                           .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                           .replace(/\*(.*?)\*/g, '<em>$1</em>')
                           .replace(/^- (.+)$/gm, '• $1')
                           .replace(/^\* (.+)$/gm, '• $1')
                           .replace(/\n/g, '<br>')
                       }}
                  />
                  <div className={`bloomberg-section-label mt-2 ${
                    message.role === 'buyer' ? 'text-[#64748B]' : 'text-blue-100'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#0EA5E9] text-white rounded-lg p-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 bloomberg-small-text">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <div className="flex space-x-2 ml-3">
              {lastFailedMessage && (
                <button
                  onClick={() => onSendMessage(lastFailedMessage)}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                >
                  Retry
                </button>
              )}
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion States */}
      {tradingState?.negotiationComplete && (
        <div className="mx-6 mb-4">
          {tradingState.outcome === 'agreed' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
              <div className="flex justify-between items-start">
                <div>
                  <div className="">Negotiation Complete — Terms Agreed</div>
                  <div className="bloomberg-small-text mt-1">
                    Final price: ${tradingState.currentOfferPrice}/t
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowProvenanceCert(true)}
                    className="bg-blue-600 text-white px-3 py-1 rounded bloomberg-small-text font-medium hover:bg-blue-700 transition-colors"
                  >
                    View Certificate
                  </button>
                  <button
                    onClick={onResetTrading}
                    className="bg-green-700 text-white px-3 py-1 rounded bloomberg-small-text font-medium hover:bg-green-800 transition-colors"
                  >
                    Start New Negotiation
                  </button>
                </div>
              </div>
            </div>
          )}
          {tradingState.outcome === 'deferred' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
              <div className="flex justify-between items-start">
                <div>
                  <div className="">Negotiation Paused — Follow-up Scheduled</div>
                  <div className="bloomberg-small-text mt-1">
                    Thank you for your interest. We&apos;ll follow up with additional options.
                  </div>
                </div>
                <button
                  onClick={onResetTrading}
                  className="bg-amber-700 text-white px-3 py-1 rounded bloomberg-small-text font-medium hover:bg-amber-800 transition-colors"
                >
                  Start New Negotiation
                </button>
              </div>
            </div>
          )}
          {tradingState.outcome === 'escalated' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
              <div className="flex justify-between items-start">
                <div>
                  <div className="">Connecting with Water Roads Team</div>
                  <div className="bloomberg-small-text mt-1">
                    Contact: trading@waterroads.com.au | +61 3 8456 7890
                  </div>
                </div>
                <button
                  onClick={onResetTrading}
                  className="bg-blue-700 text-white px-3 py-1 rounded bloomberg-small-text font-medium hover:bg-blue-800 transition-colors"
                >
                  Start New Negotiation
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* A4: Trading Scorecard */}
      {showScorecard && tradingScorecard && selectedPersona !== 'freeplay' && (
        <div className="mx-6 mb-4">
          <Scorecard
            scorecard={tradingScorecard}
            persona={selectedPersona as PersonaType}
            onClose={() => setShowScorecard(false)}
          />
        </div>
      )}

      {/* Input Area */}
      {tradingStarted && !tradingState?.negotiationComplete && (
        <div className="border-t border-slate-200 p-4">
          <div className="flex space-x-3">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder={isLoading ? "Analysing..." : "Type your trading message..."}
              disabled={isLoading}
              rows={2}
              aria-label="Type your trading message"
              aria-describedby="input-help"
              className="flex-1 p-3 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              onClick={() => onSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              aria-label={isLoading ? "Sending message" : "Send message"}
              className="bg-[#0EA5E9] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0284C7] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" aria-hidden="true"></div>
                  Sending...
                </>
              ) : (
                'Send'
              )}
            </button>
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="flex space-x-4">
              <button
                onClick={onEndTrading}
                disabled={isLoading}
                className="text-[#64748B] hover:text-[#1E293B] bloomberg-small-text font-medium disabled:opacity-50"
              >
                End Negotiation
              </button>
              <button
                onClick={onRequestHuman}
                disabled={isLoading}
                className="text-[#F59E0B] hover:text-[#D97706] bloomberg-small-text font-medium disabled:opacity-50"
              >
                Request Human Representative
              </button>
              <button
                onClick={onResetTrading}
                disabled={isLoading}
                className="text-[#0EA5E9] hover:text-[#0284C7] bloomberg-small-text font-medium disabled:opacity-50"
              >
                Start New Negotiation
              </button>
            </div>
            <div className="bloomberg-section-label text-[#64748B]">
              {inputMessage.length} characters
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
