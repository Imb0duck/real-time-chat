export enum Events {
    Connect = 'connection',
    Disconnect = 'disconnect',
    Identify = 'identify',
    Join = 'join-channel',
    Leave = 'leave-channel',
    Message = 'message',
    Kick = 'kick-user',
    Delete = 'delete-channel',
    Create = 'create-channel',
    Update = 'channels-updated',
    Participants = 'participants-updated',
    Deleted = 'channel-deleted',
    Kicked = 'kicked',
    Error = 'error'
}

export enum Routes {
    Users = '/api/users',
    Channels = '/api/channels'
}
