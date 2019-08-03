export const isInvitedBot = (userId: string, members: string[]): boolean => {
  return members.includes(userId)
}
