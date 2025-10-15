import { CopyJumpClientCommandHandler } from './copy-jump-client.command-handler';
import { CreateJumpClientInstallerCommandHandler } from './create-jump-client-installer.command-handler';
import { DeleteJumpClientInstallerCommandHandler } from './delete-jump-client-installer.command-handler';
import { DeleteJumpClientCommandHandler } from './delete-jump-client.command-handler';
import { MarkJumpClientAsSyncedCommandHandler } from './mark-jump-client-as-synced.command-handler';
import { MarkJumpClientInstallerAsSyncedCommandHandler } from './mark-jump-client-installer-as-synced.command-handler';
import { ModifyJumpClientCommandHandler } from './modify-jump-client.command-handler';

export const CommandHandlers = [
    CopyJumpClientCommandHandler,
    CreateJumpClientInstallerCommandHandler,
    DeleteJumpClientInstallerCommandHandler,
    DeleteJumpClientCommandHandler,
    ModifyJumpClientCommandHandler,
    MarkJumpClientAsSyncedCommandHandler,
    MarkJumpClientInstallerAsSyncedCommandHandler,
];
