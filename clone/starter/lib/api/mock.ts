// Simple in-memory mock REST API
import type { Card, List, Board } from '@/lib/store';
import { useStore } from '@/lib/store';

export async function fetchBoard(boardId: string): Promise<Board> {
	const { boards } = useStore.getState();
	return new Promise((resolve) => setTimeout(() => resolve(boards[boardId]), 200));
}

export async function fetchLists(boardId: string): Promise<List[]> {
	const { lists, boards } = useStore.getState();
	const listIds = boards[boardId].listIds;
	return new Promise((resolve) => setTimeout(() => resolve(listIds.map((id) => lists[id])), 200));
}

export async function fetchCards(listId: string): Promise<Card[]> {
	const { cards, lists } = useStore.getState();
	const ids = lists[listId].cardIds;
	return new Promise((resolve) => setTimeout(() => resolve(ids.map((id) => cards[id]).filter(Boolean)), 200));
}

export async function createCard(listId: string, title: string): Promise<Card> {
	return new Promise((resolve) => setTimeout(() => resolve(useStore.getState().createCard(listId, title)), 150));
}

export async function moveCard(cardId: string, toListId: string, position: number): Promise<void> {
	return new Promise((resolve) => setTimeout(() => resolve(useStore.getState().moveCard(cardId, toListId, position)), 150));
}

export async function updateCard(cardId: string, changes: Partial<Card>): Promise<void> {
	return new Promise((resolve) => setTimeout(() => resolve(useStore.getState().updateCard(cardId, changes)), 100));
}

