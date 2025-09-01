import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { eventBus } from './events';

export type Id = string;

export interface User { id: Id; name: string }

export interface Label { id: Id; name: string; color: string }
export interface ChecklistItem { id: Id; text: string; done: boolean }
export interface Checklist { id: Id; title: string; items: ChecklistItem[] }

export interface Card {
	id: Id;
	listId: Id;
	title: string;
	description?: string;
	labels: Id[];
	members: Id[];
	dueDate?: string;
	checklists: Checklist[];
	comments: { id: Id; authorId: Id; text: string; createdAt: string }[];
	position: number;
	status?: 'idle' | 'queued' | 'running' | 'succeeded' | 'failed' | 'requiresAction';
	provider?: 'openai' | 'dust' | 'aci';
	isNew?: boolean; // Flag for newly created cards
}

export interface List {
	id: Id;
	boardId: Id;
	title: string;
	cardIds: Id[];
	position: number;
}

export interface Board {
	id: Id;
	name: string;
	listIds: Id[];
}

interface StoreState {
	users: Record<Id, User>;
	labels: Record<Id, Label>;
	cards: Record<Id, Card>;
	lists: Record<Id, List>;
	boards: Record<Id, Board>;
	currentBoardId: Id;
	modalCardId?: Id;
	onboardCardId?: Id;
	setOnboardCard: (id: Id | undefined) => void;

	createList: (title: string) => List;
	createCard: (listId: Id, title: string, description?: string) => Card;
	moveCard: (cardId: Id, toListId: Id, position: number) => void;
	updateCard: (cardId: Id, changes: Partial<Card>) => void;
	markCardNotNew: (cardId: Id) => void;
	openModal: (cardId: Id) => void;
	closeModal: () => void;
	archiveCard: (cardId: Id) => void;
}

export const useStore = create<StoreState>()(
	persist(
		(set, get) => ({
			users: {},
			labels: {},
			cards: {},
			lists: {
				l1: { id: 'l1', boardId: 'b1', title: 'Backlog', cardIds: [], position: 0 },
				l2: { id: 'l2', boardId: 'b1', title: 'To Do', cardIds: [], position: 1 },
				l3: { id: 'l3', boardId: 'b1', title: 'In Progress', cardIds: [], position: 2 },
				l4: { id: 'l4', boardId: 'b1', title: 'Done', cardIds: [], position: 3 },
			},
			boards: { b1: { id: 'b1', name: 'My Board', listIds: ['l1', 'l2', 'l3', 'l4'] } },
			currentBoardId: 'b1',
			modalCardId: undefined,
			onboardCardId: undefined,
			setOnboardCard: (id) => set({ onboardCardId: id }),

			createList: (title) => {
				const id = `l_${Math.random().toString(36).slice(2, 9)}`;
				set((state) => ({
					lists: { ...state.lists, [id]: { id, boardId: state.currentBoardId, title, cardIds: [], position: Object.keys(state.lists).length } },
					boards: { ...state.boards, [state.currentBoardId]: { ...state.boards[state.currentBoardId], listIds: [...state.boards[state.currentBoardId].listIds, id] } },
				}));
				return get().lists[id];
			},

			createCard: (listId, title, description) => {
				const id = `c_${Math.random().toString(36).slice(2, 9)}`;
				const list = get().lists[listId];
				const position = list.cardIds.length;
				const card: Card = {
					id,
					listId,
					title,
					description,
					labels: [],
					members: [],
					checklists: [],
					comments: [],
					position,
					isNew: true, // Mark as newly created
				};
				set((state) => ({
					cards: { ...state.cards, [id]: card },
					lists: { ...state.lists, [listId]: { ...list, cardIds: [...list.cardIds, id] } },
				}));
				queueMicrotask(() => eventBus.emit({ type: 'card:created', payload: { listId, cardId: id, title, description, position } } as any));
				return card;
			},

			moveCard: (cardId, toListId, position) => {
				set((state) => {
					const card = state.cards[cardId];
					const fromList = state.lists[card.listId];
					const toList = state.lists[toListId];

					// Bound position
					const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

					if (fromList.id === toList.id) {
						const ids = [...fromList.cardIds];
						const fromIndex = ids.indexOf(cardId);
						if (fromIndex === -1) return {} as any;
						const toIndex = clamp(position, 0, ids.length - 1);
						ids.splice(fromIndex, 1);
						ids.splice(toIndex, 0, cardId);
						queueMicrotask(() => eventBus.emit({ type: 'card:moved', payload: { cardId, fromListId: fromList.id, toListId: toList.id, position: toIndex } } as any));
						return {
							cards: { ...state.cards, [cardId]: { ...card, position: toIndex } },
							lists: { ...state.lists, [fromList.id]: { ...fromList, cardIds: ids } },
						};
					}

					const newFromIds = fromList.cardIds.filter((id) => id !== cardId);
					const newToIds = [...toList.cardIds];
					const insertIndex = clamp(position, 0, newToIds.length);
					newToIds.splice(insertIndex, 0, cardId);
					queueMicrotask(() => eventBus.emit({ type: 'card:moved', payload: { cardId, fromListId: fromList.id, toListId: toList.id, position: insertIndex } } as any));
					const moved = {
						cards: { ...state.cards, [cardId]: { ...card, listId: toListId, position: insertIndex } },
						lists: {
							...state.lists,
							[fromList.id]: { ...fromList, cardIds: newFromIds },
							[toList.id]: { ...toList, cardIds: newToIds },
						},
					} as any;
					// Trigger onboarding when moved into To Do (l2)
					if (toListId === 'l2') set({ onboardCardId: cardId });
					return moved;
				});
			},

			updateCard: (cardId, changes) => {
				// Normalize empty titles to a safe placeholder so cards remain accessible
				const normalized = { ...changes } as Partial<Card>;
				if (typeof normalized.title === 'string') {
					const t = normalized.title.trim();
					normalized.title = t.length === 0 ? 'Untitled' : t;
				}
				set((state) => {
					const prev = state.cards[cardId];
					const isInProgress = prev?.listId === 'l3';
					const markRequires = isInProgress && (normalized.title !== undefined || normalized.description !== undefined);
					const next: Card = { ...prev, ...normalized } as Card;
					if (markRequires) next.status = 'requiresAction';
					return { cards: { ...state.cards, [cardId]: next } };
				});
				queueMicrotask(() => eventBus.emit({ type: 'card:updated', payload: { cardId, changes } } as any));
			},

			// Clear isNew flag after animation
			markCardNotNew: (cardId: Id) => {
				set((state) => ({
					cards: { ...state.cards, [cardId]: { ...state.cards[cardId], isNew: false } }
				}));
			},

			openModal: (cardId) => set({ modalCardId: cardId }),
			closeModal: () => set({ modalCardId: undefined }),

			archiveCard: (cardId) => {
				set((state) => {
					const card = state.cards[cardId];
					if (!card) return {} as any;
					const list = state.lists[card.listId];
					const newIds = list.cardIds.filter((id) => id !== cardId);
					const { [cardId]: _removed, ...restCards } = state.cards;
					return {
						cards: restCards,
						lists: { ...state.lists, [list.id]: { ...list, cardIds: newIds } },
						modalCardId: state.modalCardId === cardId ? undefined : state.modalCardId,
					};
				});
			},
		}),
		{ name: 'kanban-clone-store' },
	),
);

