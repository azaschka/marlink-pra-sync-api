import { CopyRemoteVncCommandHandler } from './copy-remote-vnc.command-handler';
import { CreateRemoteVncCommandHandler } from './create-remote-vnc.command-handler';
import { DeleteRemoteVncCommandHandler } from './delete-remote-vnc.command-handler';
import { MarkRemoteVncAsSyncedCommandHandler } from './mark-remote-vnc-as-synced.command-handler';
import { ModifyRemoteVncCommandHandler } from './modify-remote-vnc.command-handler';

export const CommandHandlers = [
    CreateRemoteVncCommandHandler,
    ModifyRemoteVncCommandHandler,
    DeleteRemoteVncCommandHandler,
    CopyRemoteVncCommandHandler,
    MarkRemoteVncAsSyncedCommandHandler,
];
