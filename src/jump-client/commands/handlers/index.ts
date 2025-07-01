import { CopyJumpClientCommandHandler } from './copy-jump-client.command-handler';
import { CreateJumpClientInstallerCommandHandler } from './create-jump-client-installer.command-handler';
import { DeleteJumpClientInstallerCommandHandler } from './delete-jump-client-installer.command-handler';
import { DeleteJumpClientCommandHandler } from './delete-jump-client.command-handler';
import { ModifyJumpClientCommandHandler } from './modify-jump-client.command-handler';
import { SyncJumpClientInstallersCommandHandler } from './sync-jump-client-installers.command-handler';
import { SyncJumpClientsCommandHandler } from './sync-jump-clients.command-handler';

export const CommandHandlers = [
    CopyJumpClientCommandHandler,
    CreateJumpClientInstallerCommandHandler,
    DeleteJumpClientInstallerCommandHandler,
    DeleteJumpClientCommandHandler,
    ModifyJumpClientCommandHandler,
    SyncJumpClientsCommandHandler,
    SyncJumpClientInstallersCommandHandler,
];
