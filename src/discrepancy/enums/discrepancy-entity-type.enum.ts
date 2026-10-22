export enum DiscrepancyEntityType {
    GroupPolicy = 'group-policy',
    GroupPolicyJumpGroup = 'group-policy-jump-group',
    GroupPolicyJumpoint = 'group-policy-jumpoint',
    GroupPolicyMember = 'group-policy-member',
    GroupPolicyTeam = 'group-policy-team',
    JumpClient = 'jump-client',
    JumpClientInstaller = 'jump-client-installer',
    JumpGroup = 'jump-group',
    JumpItemProtocolTunnelJump = 'jump-item-protocol-tunnel-jump',
    JumpItemRemoteRdp = 'jump-item-remote-rdp',
    JumpItemRemoteVnc = 'jump-item-remote-vnc',
    JumpItemShellJump = 'jump-item-shell-jump',
    JumpItemWebJump = 'jump-item-web-jump',
    JumpPolicy = 'jump-policy',
    Jumpoint = 'jumpoint',
    JumpointNode = 'jumpoint-node',
    SessionPolicy = 'session-policy',
    Team = 'team',
    TeamUser = 'team-user',
    User = 'user',
    UserGroupPolicy = 'user-group-policy',
}

/**
 * Entity types whose discrepancies describe a link between two BeyondTrust objects. Their records store the parent
 * id in `entityId` and the child id in `foreignEntityId`, so a record is identified only by both (MARLINKPRA-80).
 */
export const RELATION_DISCREPANCY_ENTITY_TYPES: ReadonlySet<DiscrepancyEntityType> = new Set([
    DiscrepancyEntityType.GroupPolicyJumpGroup,
    DiscrepancyEntityType.GroupPolicyJumpoint,
    DiscrepancyEntityType.GroupPolicyMember,
    DiscrepancyEntityType.GroupPolicyTeam,
    DiscrepancyEntityType.JumpointNode,
    DiscrepancyEntityType.TeamUser,
    DiscrepancyEntityType.UserGroupPolicy,
]);

export function isRelationDiscrepancyEntityType(entityType: DiscrepancyEntityType): boolean {
    return RELATION_DISCREPANCY_ENTITY_TYPES.has(entityType);
}
