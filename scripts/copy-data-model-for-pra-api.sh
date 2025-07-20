#!/bin/bash
# Execute this script from the root of the marlink-pra-sync-api directory.

# Use the current working directory where the script is called from
BASE_DIR="$PWD"

# List of source directories
SOURCES=(
    "$BASE_DIR/src/beyondtrust-instance"
    "$BASE_DIR/src/beyondtrust-instance-backup"
    "$BASE_DIR/src/group-policy"
    "$BASE_DIR/src/group-policy-jump-group"
    "$BASE_DIR/src/group-policy-jumpoint"
    "$BASE_DIR/src/group-policy-member"
    "$BASE_DIR/src/group-policy-team"
    "$BASE_DIR/src/jump-client"
    "$BASE_DIR/src/jump-group"
    "$BASE_DIR/src/jump-item"
    "$BASE_DIR/src/jump-policy"
    "$BASE_DIR/src/jumpoint"
    "$BASE_DIR/src/log"
    "$BASE_DIR/src/team"
    "$BASE_DIR/src/team-user"
    "$BASE_DIR/src/user"
    "$BASE_DIR/src/user-group-policy"
)

# List of target folders to copy from each source
TARGET_FOLDERS=(
    "models"
    "dtos"
    "controllers"
    "enums"
    # "commands"
    # "queries"
)

# Destination directory
DEST_DIR="$BASE_DIR/../marlink-pra-api/src"

# Ensure destination exists
mkdir -p "$DEST_DIR"

# Loop over each source directory
for SRC_DIR in "${SOURCES[@]}"; do
    MODULE_NAME="$(basename "$SRC_DIR")"

    for TARGET_FOLDER in "${TARGET_FOLDERS[@]}"; do
        SRC_PATH="$SRC_DIR/$TARGET_FOLDER"
        DEST_PATH="$DEST_DIR/$MODULE_NAME/$TARGET_FOLDER"

        if [ -d "$SRC_PATH" ]; then
            echo "Copying $SRC_PATH → $DEST_PATH"
            mkdir -p "$DEST_PATH"
            cp -r "$SRC_PATH/"* "$DEST_PATH"
        else
            echo "Skipping $SRC_PATH (not found)"
        fi
    done
done
