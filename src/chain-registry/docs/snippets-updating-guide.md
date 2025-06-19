# How to update Chain Registry snippets

## Snippets files

- `_custom.txt` - Manually created snippets
- `_generated.txt` - Auto-generated snippets from [Context 7](https://context7.com/hyperweb-io/chain-registry)
- `v1-snippets.txt` - Snippets for v1
- `v2-snippets.txt` - Snippets for v2

## Steps to update snippets

1. Go to [Context 7](https://context7.com/hyperweb-io/chain-registry) and update the snippets
2. Copy the snippets and paste them into the `_generated.txt` file
3. Create snippets from other sources (e.g. examples in CIA) and paste them into the `_custom.txt` file
4. Run `pnpm categorize:chain-registry` to categorize the snippets into the appropriate files
