type MockSession = {
  expires: string
  user: {
    id: string
    name: string
    email: string
    role: "SUPER_ADMIN" | "KAPRODI" | "DOSEN" | "VIEWER"
  }
}

export const MOCK_SESSION: MockSession = {
  expires: "2099-12-31T23:59:59.999Z",
  user: {
    id: "guest",
    name: "Guest",
    email: "guest@sipeka.local",
    role: "SUPER_ADMIN" as const,
  },
}
