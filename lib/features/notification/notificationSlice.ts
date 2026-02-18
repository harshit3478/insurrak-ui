import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Notification {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  read: boolean;
}

interface NotificationState {
  items: Notification[];
}

const initialState: NotificationState = {
  items: [],
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotification(state, action: PayloadAction<Notification>) {
      state.items.unshift(action.payload);
    },
    markAsRead(state, action: PayloadAction<string>) {
      const n = state.items.find((i) => i.id === action.payload);
      if (n) n.read = true;
    },
    markAllAsRead(state) {
      state.items.forEach((i) => (i.read = true));
    },
    setMock(state) {
      state.items = [
        {
          id: "1",
          title: "New company registered",
          description: "Acme Corp",
          createdAt: new Date().toISOString(),
          read: false,
        },
        {
          id: "2",
          title: "User invited",
          description: "john@acme.com",
          createdAt: new Date().toISOString(),
          read: true,
        },
      ];
    },
  },
});

export const { addNotification, markAsRead, markAllAsRead, setMock } =
  notificationSlice.actions;
export default notificationSlice.reducer;
