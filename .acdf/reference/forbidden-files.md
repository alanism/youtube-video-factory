# Forbidden Files and Directories

Build agents must not modify:

- `.git/`
- `node_modules/`
- user home credential folders
- provider credential stores
- system shell profiles
- existing external repositories

Build agents must not write secrets to:

- `PRODUCTION_BRIEF.md`
- `production-manifest.json`
- `provider-records/`
- `BUILD_RECEIPT.json`
- `learning_log.md`
- `.acdf/`

Generated user-project artifacts must stay under the selected `projects/<project-id>/` directory.

Exception for this ACDF wrapping change:

- `.acdf/`
- documentation
- schemas
- source
- tests
- skill files
- examples
- package metadata

No destructive cleanup is authorized as part of `youtube-video-factory-v1`.
