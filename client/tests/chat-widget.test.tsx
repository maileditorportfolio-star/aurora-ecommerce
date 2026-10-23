import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatWidget } from '@/components/chat/chat-widget';
import { useAuthStore } from '@/store/auth';

const { mockSocket, mockIo, mockChatHistory, mockChatSend } = vi.hoisted(() => {
  const mockSocket = {
    on: vi.fn(),
    emit: vi.fn(),
    removeAllListeners: vi.fn(),
    disconnect: vi.fn(),
    connected: false,
  };
  const mockIo = vi.fn(() => mockSocket);
  const mockChatHistory = vi.fn().mockResolvedValue({ messages: [] });
  const mockChatSend = vi.fn().mockResolvedValue({
    message: {
      id: 'msg-1',
      content: 'Hello',
      sender: 'USER',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  });
  return { mockSocket, mockIo, mockChatHistory, mockChatSend };
});

vi.mock('socket.io-client', () => ({
  io: mockIo,
}));

vi.mock('@/lib/api', () => ({
  api: {
    chat: {
      history: mockChatHistory,
      send: mockChatSend,
    },
  },
  getToken: () => 'test-token',
  SOCKET_URL: 'http://localhost:4000',
}));

describe('ChatWidget', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isLoading: false, error: null });
    mockIo.mockClear();
    mockSocket.on.mockClear();
    mockSocket.emit.mockClear();
    mockSocket.removeAllListeners.mockClear();
    mockSocket.disconnect.mockClear();
    mockSocket.connected = false;
    mockChatHistory.mockClear();
    mockChatSend.mockClear();
  });

  it('renders the chat toggle button', () => {
    render(<ChatWidget />);
    expect(screen.getByRole('button', { name: 'Open live chat' })).toBeInTheDocument();
  });

  it('creates a socket connection on mount', () => {
    render(<ChatWidget />);
    expect(mockIo).toHaveBeenCalledWith(
      'http://localhost:4000',
      expect.objectContaining({
        autoConnect: true,
        transports: ['websocket', 'polling'],
        auth: { token: 'test-token' },
      }),
    );
  });

  it('registers socket event handlers', () => {
    render(<ChatWidget />);
    const events = mockSocket.on.mock.calls.map((call) => call[0]);
    expect(events).toContain('connect');
    expect(events).toContain('disconnect');
    expect(events).toContain('chat:message');
    expect(events).toContain('chat:typing');
    expect(events).toContain('chat:read');
  });

  it('opens the chat panel when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<ChatWidget />);

    await user.click(screen.getByRole('button', { name: 'Open live chat' }));

    await waitFor(() => {
      expect(screen.getByText('Aurora Support')).toBeInTheDocument();
    });
  });

  it('cleans up the socket on unmount', () => {
    const { unmount } = render(<ChatWidget />);
    unmount();
    expect(mockSocket.removeAllListeners).toHaveBeenCalled();
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });

  it('sends a message via socket when connected', async () => {
    mockSocket.connected = true;
    const user = userEvent.setup();
    render(<ChatWidget />);

    await user.click(screen.getByRole('button', { name: 'Open live chat' }));

    await waitFor(() => {
      expect(screen.getByText('Aurora Support')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Type your message…');
    await user.type(input, 'Hello');

    await user.click(screen.getByRole('button', { name: 'Send message' }));

    expect(mockSocket.emit).toHaveBeenCalledWith('chat:message', {
      conversationId: 'support',
      content: 'Hello',
    });
  });

  it('does not send empty messages', async () => {
    const user = userEvent.setup();
    render(<ChatWidget />);

    await user.click(screen.getByRole('button', { name: 'Open live chat' }));

    await waitFor(() => {
      expect(screen.getByText('Aurora Support')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Send message' }));

    expect(mockSocket.emit).not.toHaveBeenCalled();
    expect(mockChatSend).not.toHaveBeenCalled();
  });

  it('loads chat history when opened', async () => {
    const user = userEvent.setup();
    render(<ChatWidget />);

    await user.click(screen.getByRole('button', { name: 'Open live chat' }));

    await waitFor(() => {
      expect(mockChatHistory).toHaveBeenCalledWith('support');
    });
  });

  it('renders messages from the chat history', async () => {
    mockChatHistory.mockResolvedValue({
      messages: [
        {
          id: '1',
          content: 'Hello from support',
          sender: 'ADMIN',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    });

    const user = userEvent.setup();
    render(<ChatWidget />);

    await user.click(screen.getByRole('button', { name: 'Open live chat' }));

    await waitFor(() => {
      expect(screen.getByText('Hello from support')).toBeInTheDocument();
    });
  });

  it('shows online status when connected', async () => {
    const user = userEvent.setup();
    render(<ChatWidget />);

    await user.click(screen.getByRole('button', { name: 'Open live chat' }));

    await waitFor(() => {
      expect(screen.getByText('Aurora Support')).toBeInTheDocument();
    });

    const connectCallback = mockSocket.on.mock.calls.find((call) => call[0] === 'connect')?.[1];

    if (connectCallback) {
      act(() => connectCallback());
    }

    await waitFor(() => {
      expect(screen.getByText('Online now')).toBeInTheDocument();
    });
  });
});
