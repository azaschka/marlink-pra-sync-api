#!/bin/bash
# Execute this script from the root of the marlink-pra-sync-api directory.

BASE_DIR="$PWD"

# Source modules
SOURCES=(
    "src/beyondtrust-instance"
    "src/beyondtrust-instance-backup"
    "src/group-policy"
    "src/group-policy-jump-group"
    "src/group-policy-jumpoint"
    "src/group-policy-member"
    "src/group-policy-team"
    "src/jump-client"
    "src/jump-group"
    "src/jump-item/protocol-tunnel-jump"
    "src/jump-item/remote-rdp"
    "src/jump-item/remote-vnc"
    "src/jump-item/shell-jump"
    "src/jump-item/web-jump"
    "src/jump-policy"
    "src/jumpoint"
    "src/log"
    "src/team"
    "src/team-user"
    "src/user"
    "src/user-group-policy"
)

# Target folders to copy from each source module
TARGET_FOLDERS=(
    "models"
    "dtos"
    "controllers"
    "enums"
    "commands"
    "queries"
)

# Exclude specific subdirectories (relative to the source folder)
EXCLUDE_PATHS=(
    "commands/handlers"
    "queries/handlers"
)

DEST_DIR="$BASE_DIR/../marlink-pra-api/src"

mkdir -p "$DEST_DIR"

for REL_SRC_DIR in "${SOURCES[@]}"; do
    FULL_SRC_DIR="$BASE_DIR/$REL_SRC_DIR"

    for TARGET_FOLDER in "${TARGET_FOLDERS[@]}"; do
        SRC_PATH="$FULL_SRC_DIR/$TARGET_FOLDER"
        RELATIVE_PATH_FROM_SRC="${REL_SRC_DIR#src/}"
        DEST_PATH="$DEST_DIR/$RELATIVE_PATH_FROM_SRC/$TARGET_FOLDER"

        if [ -d "$SRC_PATH" ]; then
            echo "Copying $SRC_PATH → $DEST_PATH"
            mkdir -p "$DEST_PATH"

            # Loop through files and skip excluded paths
            find "$SRC_PATH" -type f | while read -r file; do
                relative_file_path="${file#$SRC_PATH/}"  # path inside target folder
                MUST_SKIP_FILE=false

                for exclude in "${EXCLUDE_PATHS[@]}"; do
                    if [[ "$TARGET_FOLDER/$relative_file_path" == "$exclude"* ]]; then
                        MUST_SKIP_FILE=true
                        break
                    fi
                done

                if [ "$MUST_SKIP_FILE" = false ]; then
                    mkdir -p "$(dirname "$DEST_PATH/$relative_file_path")"
                    cp "$file" "$DEST_PATH/$relative_file_path"
                else
                    echo "  Skipping excluded file: $TARGET_FOLDER/$relative_file_path"
                fi
            done
        else
            echo "Skipping $SRC_PATH (not found)"
        fi
    done
done
