# Recovery Architecture

## Boot Sequence

1. Read primary autosave snapshot.
2. Validate checksum.
3. If invalid, fallback to backup snapshot.
4. If still invalid, fallback to emergency snapshot.
5. If all invalid, continue with default template and notice.

## Persist Sequence

1. Update primary snapshot.
2. Move previous primary into backup.
3. Update emergency snapshot for last-known-good state.

## Corruption Handling

1. Corruption events logged through lightweight logger.
2. Recovery notice displayed to user.
3. Safe mode restore can be activated manually.
