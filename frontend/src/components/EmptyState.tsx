interface EmptyStateProps {
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ message = 'No content yet', actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center h-full min-h-screen">
      <div className="text-center">
        <div className="text-gray-400 text-6xl mb-4">📄</div>
        <p className="text-gray-600 text-lg mb-4">{message}</p>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

