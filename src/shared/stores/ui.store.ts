import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void

  createWorkspaceOpen: boolean
  setCreateWorkspaceOpen: (open: boolean) => void

  addMemberOpen: boolean
  setAddMemberOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  createWorkspaceOpen: false,
  setCreateWorkspaceOpen: (open) => set({ createWorkspaceOpen: open }),

  addMemberOpen: false,
  setAddMemberOpen: (open) => set({ addMemberOpen: open }),
}))
