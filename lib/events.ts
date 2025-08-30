export type AppEvent =
	| { type: 'card:created'; payload: { listId: string; cardId: string; title: string; position: number } }
	| { type: 'card:moved'; payload: { cardId: string; fromListId: string; toListId: string; position: number } }
	| { type: 'card:updated'; payload: { cardId: string; changes: Record<string, unknown> } }
	| { type: 'checklist:updated'; payload: { cardId: string; completed: number; total: number } }
	| { type: 'board:updated'; payload: { boardId: string; changes: Record<string, unknown> } };

type Listener = (event: AppEvent) => void;

class EventBus {
	private listeners: Set<Listener> = new Set();

	public emit(event: AppEvent) {
		for (const listener of this.listeners) listener(event);
	}

	public subscribe(listener: Listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}
}

export const eventBus = new EventBus();

