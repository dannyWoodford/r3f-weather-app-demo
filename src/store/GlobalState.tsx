import { create } from 'zustand'

export interface GlobalState {
	count: number
	increment: () => void
	reset: () => void
	setCount: (value: number) => void
}

const useGlobalState = create<GlobalState>((set) => ({
	count: 0,
	increment: () => set((state) => ({ count: state.count + 1 })),
	reset: () => set({ count: 0 }),
	setCount: (value) => set({ count: value }),
}))

export default useGlobalState